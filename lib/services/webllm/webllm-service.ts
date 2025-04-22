"use client";

import { 
  WebLLMConfig, 
  DEFAULT_WEBLLM_CONFIG, 
  RECOMMENDED_MODELS, 
  WebLLMModel,
  DEFAULT_SYSTEM_PROMPT,
} from './config';

// Re-export types needed by consumers
export type { WebLLMModel, WebLLMConfig };

import { 
  RequestMessage, 
  ResponseMessage, 
  ChatResponse, 
  ModelInitProgress,
  CompletionOptions,
  CompletionUsage,
  WebLLMCallbacks,
  ChunkResponse,
  MessageRole,
  StreamChunk,
  ChatCompletionFinishReason
} from './types';

interface WebLLMInstance {
  engine: any;
  modelId: string;
  config: WebLLMConfig;
  isInitialized: boolean;
  initProgress: ModelInitProgress;
  isGenerating: boolean;
  abortController: AbortController | null;
}

let webLLMInstance: WebLLMInstance | null = null;
let lastModelCdnUrl: string | null = null;
let cachedModelList: WebLLMModel[] = [];

// Default model ID to use if none is specified
export const DEFAULT_MODEL_ID = RECOMMENDED_MODELS[0]?.id || '';

// Check if WebGPU is supported
export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

// Get available models from the WebLLM package's prebuiltAppConfig
export async function getAvailableModels(): Promise<WebLLMModel[]> {
  if (cachedModelList.length > 0) {
    return cachedModelList;
  }
  
  try {
    // Dynamically import webllm
    const webllm = await import('@mlc-ai/web-llm');
    
    if (webllm.prebuiltAppConfig && webllm.prebuiltAppConfig.model_list) {
      // Map the model list to our WebLLMModel interface with improved metadata
      cachedModelList = webllm.prebuiltAppConfig.model_list.map((model: any) => {
        // Extract model name components from model_id
        // Example: "Llama-3.1-8B-Instruct-q4f16_1" becomes "Llama 3.1 (8B)"
        const idParts = model.model_id.split('-');
        
        // Format the name more nicely
        let name = model.model_id;
        let size = '';
        let version = 'latest';
        
        // Try to extract model family name
        const modelFamily = idParts[0];

        // Try to extract model size (usually contains B for billion parameters)
        const sizeMatch = model.model_id.match(/(\d+\.?\d*)[Bb]/);
        if (sizeMatch) {
          size = `${sizeMatch[1]}B`;
        }
        
        // Try to extract version info
        const versionMatch = model.model_id.match(/[vV](\d+\.\d+)/);
        if (versionMatch) {
          version = versionMatch[1];
        }
        
        // Generate a user-friendly name
        if (modelFamily && size) {
          name = `${modelFamily} (${size})`;
        } else if (modelFamily) {
          name = modelFamily;
        }
        
        // Calculate approximate size in GB
        const sizeInGB = model.vram_required_MB ? `${(model.vram_required_MB / 1024).toFixed(1)} GB` : 'Unknown';
        
        // Generate a more informative description
        let description = model.description || `${name} model`;
        if (!model.description) {
          const features = [];
          if (model.model_id.toLowerCase().includes('instruct')) features.push('instruction-tuned');
          if (model.model_id.toLowerCase().includes('chat')) features.push('chat-optimized');
          
          // Add quantization info
          if (model.model_id.includes('q4')) features.push('4-bit quantized');
          else if (model.model_id.includes('q8')) features.push('8-bit quantized');
          
          if (features.length > 0) {
            description = `${description} (${features.join(', ')})`;
          }
        }
        
        return {
          id: model.model_id,
          name: name,
          description: description,
          contextLength: model.overrides?.context_window_size || 2048,
          size: sizeInGB,
          version: version,
          lowResourceRequired: model.low_resource_required || false,
          customModelUrl: model.model
        };
      });
      
      return cachedModelList;
    }
    
    // Fallback to recommended models if prebuiltAppConfig is not available
    return RECOMMENDED_MODELS;
  } catch (error) {
    console.error('Error loading model list:', error);
    return RECOMMENDED_MODELS;
  }
}

// Get specific model by ID
export async function getModelById(modelId: string): Promise<WebLLMModel | undefined> {
  const models = await getAvailableModels();
  return models.find(model => model.id === modelId);
}

// Get recommended models for quick selection
export function getRecommendedModels(): WebLLMModel[] {
  return RECOMMENDED_MODELS;
}

// Create and initialize the WebLLM service
export async function getWebLLMService(
  modelId: string = DEFAULT_MODEL_ID, 
  config: Partial<WebLLMConfig> = {},
  progressCallback?: (progress: number, state?: string, isFromCache?: boolean, modelCdnUrl?: string) => void
): Promise<WebLLMService> {
  // Only load the web-llm module when needed (dynamic import)
  const webllm = await import('@mlc-ai/web-llm');
  
  if (!webLLMInstance) {
    webLLMInstance = {
      engine: new webllm.MLCEngine(),
      modelId: modelId,
      config: { ...DEFAULT_WEBLLM_CONFIG, ...config },
      isInitialized: false,
      initProgress: { progress: 0, text: 'Initializing...' },
      isGenerating: false,
      abortController: null
    };

    // Set up progress callback
    webLLMInstance.engine.setInitProgressCallback((report: ModelInitProgress) => {
      if (webLLMInstance) {
        webLLMInstance.initProgress = report;
        if (progressCallback) {
          const isFromCache = report.text.toLowerCase().includes('cache');
          progressCallback(report.progress, report.text, isFromCache, lastModelCdnUrl || undefined);
        }
      }
    });
  } else if (webLLMInstance.modelId !== modelId || config) {
    // Update config if needed
    webLLMInstance.config = { ...webLLMInstance.config, ...config };
    
    // If model changed, we need to reload
    if (webLLMInstance.modelId !== modelId) {
      webLLMInstance.modelId = modelId;
      webLLMInstance.isInitialized = false;
    }
  }

  // Create service instance
  return new WebLLMService(webLLMInstance);
}

// Set the custom model URL (for loading from a specific CDN)
export function setModelCustomUrl(url: string): void {
  lastModelCdnUrl = url;
}

// WebLLM Service class
export class WebLLMService {
  private instance: WebLLMInstance;
  
  constructor(instance: WebLLMInstance) {
    this.instance = instance;
  }

  // Initialize the model if not already initialized
  async initialize(): Promise<void> {
    if (this.instance.isInitialized) return;
    
    try {
      // Configure and load the model
      await this.instance.engine.reload(
        this.instance.modelId, 
        {
          temperature: this.instance.config.temperature,
          top_p: this.instance.config.topP,
          max_gen_len: this.instance.config.maxGenerateTokens || this.instance.config.maxTokens
        }
      );
      
      this.instance.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WebLLM:', error);
      throw error;
    }
  }

  // Get initialization progress
  getInitProgress(): ModelInitProgress {
    return this.instance.initProgress;
  }

  // Check if the model is initialized
  isInitialized(): boolean {
    return this.instance.isInitialized;
  }

  // Check if the model is currently generating
  isGenerating(): boolean {
    return this.instance.isGenerating;
  }

  // Get the runtime stats (tokens/second, etc.)
  async getRuntimeStats(): Promise<string> {
    if (!this.instance.isInitialized) return '';
    return await this.instance.engine.runtimeStatsText();
  }

  // Generate a response from the model
  async generate(
    messages: RequestMessage[],
    options: CompletionOptions = {},
    callbacks: WebLLMCallbacks = {}
  ): Promise<ChatResponse> {
    if (!this.instance.isInitialized) {
      await this.initialize();
    }

    // Ensure we have a system message
    if (!messages.some(m => m.role === MessageRole.System)) {
      messages = [
        { role: MessageRole.System, content: DEFAULT_SYSTEM_PROMPT },
        ...messages
      ];
    }

    // Set up the abort controller
    this.instance.abortController = new AbortController();
    this.instance.isGenerating = true;
    
    try {
      let finalResponse: ChatResponse = { 
        message: { role: MessageRole.Assistant, content: '' }
      };
      
      // Handle streaming vs non-streaming
      if (options.stream) {
        finalResponse = await this.generateStreaming(messages, options, callbacks);
      } else {
        const completion = await this.instance.engine.chat.completions.create({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: options.temperature ?? this.instance.config.temperature,
          top_p: options.topP ?? this.instance.config.topP,
          max_tokens: options.maxTokens ?? this.instance.config.maxTokens,
          presence_penalty: options.presencePenalty ?? this.instance.config.presencePenalty,
          frequency_penalty: options.frequencyPenalty ?? this.instance.config.frequencyPenalty,
          stop: options.stopStrings ?? this.instance.config.stopStrings
        });
        
        const content = completion.choices[0].message.content;
        const finish_reason = completion.choices[0].finish_reason;
        
        finalResponse = {
          message: {
            role: MessageRole.Assistant,
            content,
            finish_reason
          },
          usage: {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0
          }
        };
      }
      
      // Call the finish callback if provided
      if (callbacks.onFinishCallback) {
        callbacks.onFinishCallback(finalResponse);
      }
      
      return finalResponse;
    } catch (error) {
      if (callbacks.onErrorCallback) {
        callbacks.onErrorCallback(error as Error);
      }
      throw error;
    } finally {
      this.instance.isGenerating = false;
      this.instance.abortController = null;
    }
  }

  // Stream generation for token-by-token output
  private async generateStreaming(
    messages: RequestMessage[],
    options: CompletionOptions,
    callbacks: WebLLMCallbacks
  ): Promise<ChatResponse> {
    let fullText = '';
    let finalMessage: ResponseMessage = {
      role: MessageRole.Assistant,
      content: ''
    };
    
    try {
      const completion = await this.instance.engine.chat.completions.create({
        stream: true,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options.temperature ?? this.instance.config.temperature,
        top_p: options.topP ?? this.instance.config.topP,
        max_tokens: options.maxTokens ?? this.instance.config.maxTokens,
        presence_penalty: options.presencePenalty ?? this.instance.config.presencePenalty,
        frequency_penalty: options.frequencyPenalty ?? this.instance.config.frequencyPenalty,
        stop: options.stopStrings ?? this.instance.config.stopStrings
      });
      
      for await (const chunk of completion) {
        const streamChunk = chunk as unknown as StreamChunk;
        const delta = streamChunk.choices[0].delta.content;
        
        if (delta) {
          fullText += delta;
          
          // Call the token callback if provided
          if (callbacks.onTokenCallback) {
            callbacks.onTokenCallback(delta, fullText);
          }
        }
        
        // Check if generation was aborted
        if (this.instance.abortController?.signal.aborted) {
          break;
        }
      }
      
      // Get the final message and usage
      finalMessage = {
        role: MessageRole.Assistant,
        content: fullText,
        finish_reason: ChatCompletionFinishReason.Stop
      };
      
      // Get usage information
      const usage = await this.getCompletionUsage();
      
      return {
        message: finalMessage,
        usage
      };
    } catch (error) {
      console.error('Error during streaming generation:', error);
      throw error;
    }
  }

  // Abort generation if it's in progress
  abortGeneration(): void {
    if (this.instance.isGenerating && this.instance.abortController) {
      this.instance.abortController.abort();
      this.instance.isGenerating = false;
    }
  }

  // Get token usage information
  private async getCompletionUsage(): Promise<CompletionUsage> {
    try {
      const usage = await this.instance.engine.getMessage();
      return {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
        promptEvalCount: usage.prompt_eval_count,
        evalCount: usage.eval_count
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      };
    }
  }

  // Clear the model cache
  async clearCache(thorough: boolean = false): Promise<void> {
    await this.instance.engine.unload();
    if (thorough && 'clearCache' in this.instance.engine) {
      await (this.instance.engine as any).clearCache();
    }
    this.instance.isInitialized = false;
  }
} 
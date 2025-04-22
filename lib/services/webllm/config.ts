"use client";

/**
 * WebLLM Configuration
 * Defines the available models and configuration options
 */

export interface WebLLMConfig {
  appName: string;
  systemPrompt: string;
  temperature: number;
  maxGenerateTokens: number;
  topP: number;
  maxHistory: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopStrings?: string[];
  contextWindowSize?: number;
  slidingWindowSize?: number;
  attentionSinkSize?: number;
}

export interface WebLLMModel {
  id: string;
  name: string;
  description: string;
  contextLength: number;
  size: string;
  version: string;
  lowResourceRequired?: boolean;
  customModelUrl?: string;
}

// Instead of defining all models manually, our service will fetch the model list 
// directly from the WebLLM package at runtime using:
// webllm.prebuiltAppConfig.model_list

// Recommended models for quick selection (subset of most popular/useful models)
export const RECOMMENDED_MODELS: WebLLMModel[] = [
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1",
    name: "TinyLlama (1.1B)",
    description: "Smallest model, fastest performance, good for basic tasks",
    contextLength: 2048,
    size: "0.6 GB",
    version: "1.0",
    lowResourceRequired: true
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1",
    name: "Phi-3-mini (3.8B)",
    description: "Microsoft's efficient, small-scale model with strong reasoning",
    contextLength: 4096,
    size: "2.2 GB",
    version: "1.0"
  },
  {
    id: "Llama-3.1-8B-Instruct-q4f16_1",
    name: "Llama 3.1 (8B)",
    description: "Meta's latest instruction-tuned model with excellent performance",
    contextLength: 8192,
    size: "4.7 GB",
    version: "1.0"
  },
  {
    id: "gemma-2b-it-q4f32_1",
    name: "Gemma (2B)",
    description: "Google's lightweight but capable instruction model",
    contextLength: 8192,
    size: "1.3 GB",
    version: "1.0",
    lowResourceRequired: true
  },
  {
    id: "Mistral-7B-Instruct-v0.2-q4f16_1",
    name: "Mistral (7B)",
    description: "Excellent reasoning and instruction following capabilities",
    contextLength: 8192,
    size: "4.1 GB",
    version: "0.2"
  }
];

// Default system prompt for the chat
export const DEFAULT_SYSTEM_PROMPT = "You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should be clear, comprehensive and accurate. If a question is unclear or lacks details, explain why and suggest improvements. If you're unsure, simply state that you don't know rather than making up information. Do not reference this instruction in your answers.";

// Default WebLLM configuration
export const DEFAULT_WEBLLM_CONFIG: WebLLMConfig = {
  appName: 'FreeTool WebLLM Chat',
  systemPrompt: 'You are a helpful AI assistant.',
  temperature: 0.7,
  maxGenerateTokens: 2048,
  topP: 0.95,
  maxHistory: 20,
};

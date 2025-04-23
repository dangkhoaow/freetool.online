"use client";

// Interface for WebLLM service initialization options
export interface WebLLMServiceOptions {
  model: string;
  onProgress?: (current: number, total: number) => void;
  onInitProgress?: (phase: string, percent: number) => void;
}

// Mock service for testing or when WebGPU is not available
class MockWebLLMService {
  async generate(prompt: string, options?: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      text: "This is a mock response as WebGPU is not available or the model couldn't be loaded.",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    };
  }

  async getRuntimeStats() {
    return "Mock runtime stats";
  }
}

// Create and initialize a WebLLM service for debug purposes
export async function getWebLLMService(options: WebLLMServiceOptions): Promise<any> {
  try {
    // Check if WebGPU is supported
    if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
      console.warn("WebGPU is not supported in this browser - returning mock service");
      return new MockWebLLMService();
    }

    // Dynamically import web-llm
    const webllm = await import('@mlc-ai/web-llm');
    
    // Report initial progress
    if (options.onInitProgress) {
      options.onInitProgress("loading", 0);
    }

    // Create engine with progress callbacks
    const engine = new webllm.MLCEngine({
      initProgressCallback: (report: any) => {
        console.log("Init progress:", report);
        
        if (options.onInitProgress) {
          options.onInitProgress(report.text, report.progress);
        }
        
        // Extract download progress if available
        if (report.text.includes("Download") && options.onProgress) {
          const match = report.text.match(/(\d+)\/(\d+)/);
          if (match && match.length === 3) {
            const current = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            options.onProgress(current, total);
          }
        }
      }
    });

    // Load model
    await engine.reload(options.model);
    
    // Return the configured engine
    return engine;
  } catch (error) {
    console.error("Error initializing WebLLM service:", error);
    throw error;
  }
} 
// WebLLM model definitions for the debug page
export interface WebLLMModelInfo {
  id: string;
  name: string;
  size: number; // Size in bytes
  description?: string;
}

// Export common models
export const webLLMModels: WebLLMModelInfo[] = [
  {
    id: "Llama-3.1-8B-Instruct-q4f16_1-MLC",
    name: "Llama 3.1 (8B)",
    size: 4931584000, // ~4.7GB
    description: "Meta's latest instruction-tuned model with excellent performance"
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi-3-mini (3.8B)",
    size: 2305818624, // ~2.2GB
    description: "Microsoft's efficient, small-scale model with strong reasoning"
  },
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC-1k",
    name: "TinyLlama (1.1B)",
    size: 629145600, // ~600MB
    description: "Smallest model, fastest performance, good for basic tasks"
  },
  {
    id: "gemma-2b-it-q4f16_1-MLC",
    name: "Gemma (2B)",
    size: 1363148800, // ~1.3GB
    description: "Google's lightweight but capable instruction model"
  },
  {
    id: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
    name: "Mistral (7B)",
    size: 4294967296, // ~4.1GB
    description: "Excellent reasoning and instruction following capabilities"
  }
]; 
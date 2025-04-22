"use client";

/**
 * WebLLM Types
 * Type definitions for the WebLLM service
 */

export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
  Tool = 'tool'
}

export interface RequestMessage {
  role: MessageRole | string;
  content: string;
}

export interface ResponseMessage extends RequestMessage {
  finish_reason?: ChatCompletionFinishReason;
}

export enum ChatCompletionFinishReason {
  Stop = 'stop',
  Length = 'length',
  ToolCalls = 'tool_calls',
  ContentFilter = 'content_filter',
  FunctionCall = 'function_call'
}

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopStrings?: string[];
  stream?: boolean;
}

export interface CompletionUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptEvalCount?: number;
  evalCount?: number;
}

export interface ModelInitProgress {
  progress: number;
  text: string;
}

export interface ChatResponse {
  message: ResponseMessage;
  usage?: CompletionUsage;
}

export interface ChunkResponse {
  text: string;
  isPartial: boolean;
  usage?: CompletionUsage;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: ChatCompletionFinishReason | null;
  }>;
}

export interface ModelCacheInfo {
  modelId: string;
  sizeInBytes: number;
  lastAccessed: number;
}

export interface WebLLMCallbacks {
  onTokenCallback?: (token: string, fullText: string, usage?: CompletionUsage) => void;
  onFinishCallback?: (response: ChatResponse) => void;
  onErrorCallback?: (error: Error) => void;
} 
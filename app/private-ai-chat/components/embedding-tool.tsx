"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { isEmbeddingModel, getWebLLMService } from '@/lib/services/webllm/webllm-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function EmbeddingTool({ 
  modelId 
}: { 
  modelId: string 
}) {
  const [inputText, setInputText] = useState('');
  const [embeddings, setEmbeddings] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const webLLMServiceRef = useRef<any>(null);

  useEffect(() => {
    const initModel = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isEmbeddingModel(modelId)) {
          setError('This is not an embedding model. Please select an embedding model like "snowflake-arctic-embed" to generate embeddings.');
          setModelLoaded(false);
          return;
        }

        const webLLMService = await getWebLLMService();
        webLLMServiceRef.current = webLLMService;
        
        // Initialize with the embedding model
        await webLLMService.loadModel(modelId, (progress: string) => {
          console.log('Loading model progress:', progress);
        });
        
        setModelLoaded(true);
      } catch (err) {
        console.error('Error initializing embedding model:', err);
        setError(`Error loading model: ${err instanceof Error ? err.message : String(err)}`);
        setModelLoaded(false);
      } finally {
        setLoading(false);
      }
    };

    initModel();

    return () => {
      // Clean up
      if (webLLMServiceRef.current) {
        try {
          if (typeof webLLMServiceRef.current.dispose === 'function') {
            webLLMServiceRef.current.dispose();
          } else if (typeof webLLMServiceRef.current.unload === 'function') {
            webLLMServiceRef.current.unload();
          }
        } catch (err) {
          console.error('Error disposing WebLLM service:', err);
        }
      }
    };
  }, [modelId]);

  const generateEmbedding = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to generate embeddings.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const embeddings = await webLLMServiceRef.current.generateEmbeddings(inputText.trim());
      if (embeddings) {
        setEmbeddings(embeddings);
      } else {
        setError('Failed to generate embeddings');
      }
    } catch (err) {
      console.error('Error generating embeddings:', err);
      setError(`Error generating embeddings: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Text Embedding Generator</CardTitle>
          <CardDescription>
            Generate vector embeddings from text using the {modelId} model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {modelLoaded && (
            <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Model Ready</AlertTitle>
              <AlertDescription>
                The embedding model is loaded and ready to use
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to generate embeddings..."
                className="min-h-[100px]"
                disabled={loading || !modelLoaded}
              />
            </div>

            <Button 
              onClick={generateEmbedding} 
              disabled={loading || !modelLoaded || !inputText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Embedding'
              )}
            </Button>

            {embeddings && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Embedding Vector (first 10 values):</h3>
                <div className="bg-slate-50 p-3 rounded-md overflow-x-auto">
                  <pre className="text-xs">
                    {JSON.stringify(embeddings.slice(0, 10), null, 2)}... 
                    ({embeddings.length} dimensions)
                  </pre>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Note: Only showing first 10 dimensions. Total dimensions: {embeddings.length}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
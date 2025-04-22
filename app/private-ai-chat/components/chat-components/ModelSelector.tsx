"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Loader2, Database, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { WebLLMModel } from "@/lib/services/webllm/webllm-service"

interface ModelSelectorProps {
  models: WebLLMModel[]
  selectedModel: string
  setSelectedModel: (model: string) => void
  cachedModels: string[]
  isModelLoaded: boolean
  isLoading: boolean
  loadingStatus: string 
  loadingProgress: number
  handleModelLoad: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

export function ModelSelector({
  models,
  selectedModel,
  setSelectedModel,
  cachedModels,
  isModelLoaded,
  isLoading,
  loadingStatus,
  loadingProgress,
  handleModelLoad,
  open,
  setOpen
}: ModelSelectorProps) {
  if (isModelLoaded) return null
  
  return (
    <div className="space-y-2">
      <Label htmlFor="model-selection">Select Model</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="model-selection"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isModelLoaded || isLoading}
            >
              {selectedModel ? (
                <div className="flex items-center">
                  <span className="truncate mr-2">
                    {models.find(m => m.id === selectedModel)?.name || selectedModel}
                  </span>
                  {models.find(m => m.id === selectedModel)?.lowResourceRequired && (
                    <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded ml-auto mr-1">
                      Low
                    </span>
                  )}
                  {cachedModels.includes(selectedModel) && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded flex items-center ml-auto">
                      <Database className="h-3 w-3 mr-1" /> Cached
                    </span>
                  )}
                </div>
              ) : (
                "Select model"
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command className="w-full">
              <CommandInput placeholder="Search models..." className="w-full" />
              <CommandEmpty>No models found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {models.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={(currentValue) => {
                        setSelectedModel(currentValue)
                        // Save selection to localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('webllm-last-model', currentValue)
                        }
                        setOpen(false)
                      }}
                      className="flex flex-col items-start py-2 text-left w-full px-3"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-medium mr-2">{model.name}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          {cachedModels.includes(model.id) && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded flex items-center">
                              <Database className="h-3 w-3 mr-1" /> Cached
                            </span>
                          )}
                          {model.id === selectedModel && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 w-full text-left">
                        <div>{model.description}</div>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          <span className="font-medium">Size:</span> {model.size}
                          <span className="font-medium ml-2">Context:</span> {model.contextLength} tokens
                          {model.lowResourceRequired && (
                            <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                              Low Resource
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Button 
          onClick={handleModelLoad} 
          disabled={isModelLoaded || isLoading || !selectedModel}
          className={cn("whitespace-nowrap min-w-[110px]", isLoading && "bg-blue-600 hover:bg-blue-700")}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : isModelLoaded ? (
            "Model Loaded"
          ) : (
            "Load Model"
          )}
        </Button>
      </div>
      {isLoading && (
        <div className="mt-2 space-y-2">
          <div className="text-xs text-gray-600">{loadingStatus || "Loading model..."}</div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${loadingProgress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
} 
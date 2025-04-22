"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { WebLLMModel } from "@/lib/services/webllm/webllm-service"

interface ChatSession {
  id: string
  title: string
  modelId: string
  messages: any[]
  lastUpdated: number
  createdAt: number
}

interface ChatSidebarProps {
  chatSessions: ChatSession[]
  models: WebLLMModel[]
  activeChatId: string | null
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (collapsed: boolean) => void
  createNewChat: () => void
  setActiveChat: (chatId: string) => void
  deleteChat: (chatId: string, e: React.MouseEvent) => void
}

export function ChatSidebar({
  chatSessions,
  models,
  activeChatId,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  createNewChat,
  setActiveChat,
  deleteChat
}: ChatSidebarProps) {
  return (
    <>
      {/* Chat History Sidebar */}
      <div className={cn(
        "bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "w-0 overflow-hidden" : "w-72"
      )}>
        <div className="p-4 flex flex-col h-full">
          <Button 
            onClick={createNewChat} 
            variant="outline" 
            className="mb-4 flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-100"
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
          
          <ScrollArea className="flex-grow">
            <div className="space-y-2">
              {chatSessions.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer flex items-start group relative",
                    activeChatId === chat.id 
                      ? "bg-blue-100 text-blue-800" 
                      : "hover:bg-gray-100"
                  )}
                >
                  <MessageSquare className="h-4 w-4 mt-1 mr-2 shrink-0" />
                  <div className="flex-grow overflow-hidden pr-8 w-52">
                    <div className="text-sm font-medium truncate w-full">{chat.title}</div>
                    <div className="text-xs text-gray-500 truncate w-full">
                      {chat.modelId ? models.find(m => m.id === chat.modelId)?.name.split(' ').slice(0, 2).join(' ') || chat.modelId : 'No model selected'}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 absolute right-2 top-3 opacity-30 hover:opacity-100 group-hover:opacity-100 shrink-0 z-10 hover:bg-gray-200"
                    onClick={(e) => deleteChat(chat.id, e)}
                  >
                    <Trash className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              ))}
              
              {chatSessions.length === 0 && (
                <div className="text-sm text-gray-500 text-center p-4">
                  No chat history yet. Start a new chat!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Toggle sidebar button */}
      <button 
        className="absolute top-1/2 -translate-y-1/2 left-0 bg-gray-200 p-1 rounded-r-md z-10"
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform",
          isSidebarCollapsed ? "" : "rotate-180"
        )} />
      </button>
    </>
  )
} 
"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lightbulb, Save, Scissors, AlertTriangle } from "lucide-react"

interface TokenLimitDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onTrimConversation: () => void
  onExportChat: () => void
  onNewChat: () => void
}

export function TokenLimitDialog({
  open,
  setOpen,
  onTrimConversation,
  onExportChat,
  onNewChat
}: TokenLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Conversation Too Long
          </DialogTitle>
          <DialogDescription>
            This conversation has become too large for the AI model to process. Here are your options:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-800 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
              <Scissors className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Trim the conversation</h3>
              <p className="text-sm text-gray-500">
                Remove older messages while keeping recent ones and the system context.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => {
                  onTrimConversation()
                  setOpen(false)
                }}
              >
                Trim conversation
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 text-green-800 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
              <Save className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Export and start fresh</h3>
              <p className="text-sm text-gray-500">
                Save this conversation as a file and start a new one.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={() => {
                  onExportChat()
                  onNewChat()
                  setOpen(false)
                }}
              >
                Export and new chat
              </Button>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 text-amber-800 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Tips for managing conversations</h3>
              <ul className="text-sm text-gray-500 list-disc pl-5 mt-1 space-y-1">
                <li>Keep messages concise and on-topic</li>
                <li>Start new chats for different subjects</li>
                <li>Export important conversations before they get too long</li>
                <li>Use the token display to monitor conversation size</li>
              </ul>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
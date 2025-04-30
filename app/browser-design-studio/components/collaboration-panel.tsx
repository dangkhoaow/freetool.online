'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Share2, 
  Users, 
  Copy, 
  Check, 
  LogOut, 
  User, 
  UserPlus 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { 
  collaborationService, 
  type CollaborationState,
  type CollaborationUser,
  type DocumentData
} from '@/lib/services/browser-design-studio/collaboration-service'
import { useDesignStudio } from '@/lib/services/browser-design-studio/store-provider'
import { useVectorStore } from '@/lib/services/browser-design-studio/stores/vector-store'
import { useRasterStore } from '@/lib/services/browser-design-studio/stores/raster-store'
import { useTextStore } from '@/lib/services/browser-design-studio/stores/text-store'
import { Switch } from '@/components/ui/switch'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function CollaborationPanel() {
  const { documentName, setDocumentName, documentDimensions } = useDesignStudio()
  const setVectorData = useVectorStore(state => state.setState)
  const setRasterData = useRasterStore(state => state.setState)
  const setTextData = useTextStore(state => state.setState)
  
  // Collaboration state
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isCollaborating: false,
    roomId: null,
    users: [],
    localUser: null,
    shareUrl: null,
    error: null
  })
  
  // UI state
  const [userName, setUserName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [copied, setCopied] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false)
  const [collaborationMenuOpen, setCollaborationMenuOpen] = useState(false)
  const [cursorSharing, setCursorSharing] = useState(true)
  const [showUserDialogs, setShowUserDialogs] = useState<Record<string, boolean>>({})

  // Initialize collaboration service listeners
  useEffect(() => {
    // Set default username from localStorage or a random name
    const savedName = localStorage.getItem('design-studio-username') || generateRandomName()
    setUserName(savedName)
    
    // Subscribe to collaboration state changes
    collaborationService.onStateChange(state => {
      setCollaborationState(state)
    })
    
    // Subscribe to document data changes
    collaborationService.onDocumentChange(data => {
      handleIncomingDocumentData(data)
    })
    
    // Check URL for collaboration parameter
    const searchParams = new URLSearchParams(window.location.search)
    const collaborateParam = searchParams.get('collaborate')
    
    if (collaborateParam) {
      setJoinRoomId(collaborateParam)
      setShowJoinDialog(true)
    }
    
    // Clean up
    return () => {
      if (collaborationState.isCollaborating) {
        collaborationService.endCollaboration()
      }
    }
  }, [])

  // Handle incoming document data from collaboration
  const handleIncomingDocumentData = useCallback((data: DocumentData) => {
    // Update stores with received data
    if (data.vector) {
      setVectorData(data.vector)
    }
    
    if (data.raster) {
      setRasterData(data.raster)
    }
    
    if (data.text) {
      setTextData(data.text)
    }
    
    // Update document metadata
    if (data.metadata) {
      setDocumentName(data.metadata.name)
    }
  }, [setVectorData, setRasterData, setTextData, setDocumentName])

  // Start a new collaboration session
  const startCollaboration = async () => {
    // Save username to localStorage
    localStorage.setItem('design-studio-username', userName)
    
    // Generate a unique document ID if not already collaborating
    const documentId = crypto.randomUUID()
    
    // Initialize collaboration
    const success = await collaborationService.initCollaboration(documentId, userName)
    
    if (success) {
      // Share current document state
      const vectorData = useVectorStore.getState()
      const rasterData = useRasterStore.getState()
      const textData = useTextStore.getState()
      
      collaborationService.updateVectorData(vectorData)
      collaborationService.updateRasterData(rasterData)
      collaborationService.updateTextData(textData)
      collaborationService.updateMetadata({
        name: documentName,
        dimensions: documentDimensions,
        lastModified: new Date()
      })
      
      // Show share dialog
      setShowCollaborationDialog(false)
      setShowShareDialog(true)
    }
  }

  // Join an existing collaboration session
  const joinCollaboration = async () => {
    // Save username to localStorage
    localStorage.setItem('design-studio-username', userName)
    
    // Join room
    const success = await collaborationService.joinCollaboration(joinRoomId, userName)
    
    if (success) {
      setShowJoinDialog(false)
    }
  }

  // End the current collaboration session
  const endCollaboration = () => {
    collaborationService.endCollaboration()
    setCollaborationMenuOpen(false)
  }

  // Copy share URL to clipboard
  const copyShareUrl = () => {
    if (collaborationState.shareUrl) {
      navigator.clipboard.writeText(collaborationState.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Generate a random user name
  function generateRandomName() {
    const adjectives = ['Creative', 'Artistic', 'Inspired', 'Colorful', 'Imaginative', 'Brilliant']
    const nouns = ['Designer', 'Creator', 'Artist', 'Maker', 'Crafter', 'Innovator']
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNumber = Math.floor(Math.random() * 100)
    
    return `${randomAdjective}${randomNoun}${randomNumber}`
  }

  // Handle user button click
  const handleUserClick = (userId: string) => {
    setShowUserDialogs(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  // Toggle user cursor display
  const toggleCursorSharing = () => {
    setCursorSharing(!cursorSharing)
    
    if (cursorSharing) {
      // Stop sharing cursor
      collaborationService.updateCursor(null)
    }
  }

  // Render user cursor
  const renderUserCursors = () => {
    if (!cursorSharing || !collaborationState.isCollaborating) return null
    
    return collaborationState.users.map(user => {
      if (user.id === collaborationState.localUser?.id || !user.cursor) return null
      
      return (
        <div 
          key={user.id}
          className="absolute pointer-events-none z-50 transition-all duration-100 ease-in-out"
          style={{ 
            left: user.cursor.x, 
            top: user.cursor.y,
            transform: 'translate(8px, 8px)'
          }}
        >
          <div 
            className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="mt-1 px-2 py-1 rounded text-xs white font-medium shadow-sm" style={{ backgroundColor: user.color }}>
            {user.name}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-rose-600" />
          Collaboration
        </h3>
        
        {collaborationState.isCollaborating ? (
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 border-green-200">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> 
              Active Session
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setCollaborationMenuOpen(!collaborationMenuOpen)}
            >
              <Users className="h-4 w-4 mr-1" />
              {collaborationState.users.length}
            </Button>
            
            {collaborationMenuOpen && (
              <div className="absolute right-6 mt-40 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h4 className="font-medium">Collaboration</h4>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={endCollaboration}
                  >
                    <LogOut className="h-4 w-4 mr-1" /> Leave
                  </Button>
                </div>
                
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cursor-sharing">Show cursors</Label>
                    <Switch
                      id="cursor-sharing"
                      checked={cursorSharing}
                      onCheckedChange={toggleCursorSharing}
                    />
                  </div>
                </div>
                
                <div className="p-3 max-h-60 overflow-y-auto">
                  <h4 className="font-medium mb-2">Participants</h4>
                  <ul className="space-y-2">
                    {collaborationState.users.map(user => (
                      <li key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold mr-2"
                            style={{ backgroundColor: user.color }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">
                            {user.name} 
                            {user.id === collaborationState.localUser?.id && (
                              <span className="text-xs ml-1 text-gray-500">(you)</span>
                            )}
                          </span>
                        </div>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6"
                                onClick={() => handleUserClick(user.id)}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {showUserDialogs[user.id] && (
                          <div className="absolute right-16 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-3 w-48 z-50">
                            <h5 className="font-medium mb-2">{user.name}</h5>
                            <p className="text-xs text-gray-500 mb-1">Currently in: {user.activeTab || 'vector'} tab</p>
                            {user.selection && user.selection.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Selected: {user.selection.length} item(s)
                              </p>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="mt-2 w-full"
                              onClick={() => setShowUserDialogs(prev => ({...prev, [user.id]: false}))}
                            >
                              Close
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCollaborationMenuOpen(false)
                      setShowShareDialog(true)
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-1" /> Share link
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Dialog open={showCollaborationDialog} onOpenChange={setShowCollaborationDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-1" />
                Collaborate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start Collaboration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your display name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={startCollaboration}
                    disabled={!userName.trim()}
                    className="flex-1"
                  >
                    Start new session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCollaborationDialog(false)
                      setShowJoinDialog(true)
                    }}
                    className="flex-1"
                  >
                    Join existing
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {collaborationState.isCollaborating && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span className="font-medium">Active collaboration session</span> with {collaborationState.users.length} participant(s)
          </p>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share link
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={endCollaboration}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Leave session
            </Button>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      {!collaborationState.isCollaborating && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Collaborate with others in real-time without uploading your designs to any server. All collaboration happens directly between browsers using secure peer-to-peer connections.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-400 flex items-center text-sm">
              <Users className="h-4 w-4 mr-1" />
              How it works
            </h4>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
              <li>Start a new session or join an existing one</li>
              <li>Share the collaboration link with others</li>
              <li>See real-time changes as others edit the design</li>
              <li>All changes are synchronized directly between participants</li>
              <li>Your design never leaves your device</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Collaboration Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Share this link with others to collaborate on this design.
            </p>
            <div className="flex space-x-2">
              <Input
                readOnly
                value={collaborationState.shareUrl || ''}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={copyShareUrl}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Currently active: {collaborationState.users.length} participant(s)</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Collaboration Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your display name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomId">Session ID or full URL</Label>
              <Input
                id="roomId"
                placeholder="Enter session ID or paste the full URL"
                value={joinRoomId}
                onChange={(e) => {
                  // Extract the session ID if a full URL was pasted
                  let input = e.target.value
                  if (input.includes('?collaborate=')) {
                    input = input.split('?collaborate=')[1].split('&')[0]
                  }
                  setJoinRoomId(input)
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={joinCollaboration}
              disabled={!userName.trim() || !joinRoomId.trim()}
            >
              Join Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Render collaborative cursors */}
      {renderUserCursors()}
    </div>
  )
}

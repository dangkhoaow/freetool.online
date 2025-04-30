/**
 * Collaboration Service
 * 
 * Provides real-time collaboration functionality using Yjs and WebRTC
 * This allows for peer-to-peer collaborative editing without any server involvement
 */

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'

// Types
export interface CollaborationUser {
  id: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  selection?: string[]
  activeTab?: string
}

export interface CollaborationState {
  isCollaborating: boolean
  roomId: string | null
  users: CollaborationUser[]
  localUser: CollaborationUser | null
  shareUrl: string | null
  error: string | null
}

export interface DocumentData {
  vector: any
  raster: any
  text: any
  metadata: {
    name: string
    dimensions: { width: number; height: number }
    lastModified: Date
  }
}

class CollaborationService {
  private doc: Y.Doc | null = null
  private vectorData: Y.Map<any> | null = null
  private rasterData: Y.Map<any> | null = null
  private textData: Y.Map<any> | null = null
  private metadata: Y.Map<any> | null = null
  private awareness: any | null = null
  private provider: WebrtcProvider | null = null
  private persistence: IndexeddbPersistence | null = null
  private roomId: string | null = null
  private localUser: CollaborationUser | null = null
  private onStateChangeCallbacks: ((state: CollaborationState) => void)[] = []
  private onDocumentChangeCallbacks: ((data: DocumentData) => void)[] = []

  // Initialize a new collaboration session
  async initCollaboration(documentId: string, userName: string): Promise<boolean> {
    try {
      // Generate room ID based on document ID for consistent room naming
      this.roomId = `freetool-design-${documentId}`
      
      // Initialize Yjs document
      this.doc = new Y.Doc()
      
      // Get shared data structures
      this.vectorData = this.doc.getMap('vector')
      this.rasterData = this.doc.getMap('raster')
      this.textData = this.doc.getMap('text')
      this.metadata = this.doc.getMap('metadata')
      
      // Set up WebRTC provider (peer-to-peer connection)
      this.provider = new WebrtcProvider(this.roomId, this.doc, {
        signaling: ['wss://signaling.yjs.dev'] // Public signaling server
      })
      
      // Set up persistence to IndexedDB
      this.persistence = new IndexeddbPersistence(this.roomId, this.doc)
      
      // Get the awareness instance for tracking users
      this.awareness = this.provider.awareness
      
      // Create local user with random color
      const colors = ['#e11d48', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      this.localUser = {
        id: this.doc.clientID.toString(),
        name: userName,
        color: randomColor
      }
      
      // Set awareness state
      this.awareness.setLocalState({
        user: this.localUser,
        cursor: null,
        selection: null,
        activeTab: 'vector'
      })
      
      // Listen for awareness changes
      this.awareness.on('change', this.handleAwarenessChange.bind(this))
      
      // Listen for document changes
      this.vectorData.observe(this.handleDocumentChange.bind(this))
      this.rasterData.observe(this.handleDocumentChange.bind(this))
      this.textData.observe(this.handleDocumentChange.bind(this))
      this.metadata.observe(this.handleDocumentChange.bind(this))
      
      // Generate share URL
      const shareUrl = `${window.location.origin}/browser-design-studio?collaborate=${this.roomId}`
      
      // Notify state change
      this.notifyStateChange({
        isCollaborating: true,
        roomId: this.roomId,
        users: this.getUsers(),
        localUser: this.localUser,
        shareUrl,
        error: null
      })
      
      return true
    } catch (error) {
      console.error('Error initializing collaboration:', error)
      
      // Notify error
      this.notifyStateChange({
        isCollaborating: false,
        roomId: null,
        users: [],
        localUser: null,
        shareUrl: null,
        error: 'Failed to initialize collaboration session'
      })
      
      return false
    }
  }

  // Join an existing collaboration session
  async joinCollaboration(roomId: string, userName: string): Promise<boolean> {
    try {
      this.roomId = roomId
      
      // Initialize Yjs document
      this.doc = new Y.Doc()
      
      // Get shared data structures
      this.vectorData = this.doc.getMap('vector')
      this.rasterData = this.doc.getMap('raster')
      this.textData = this.doc.getMap('text')
      this.metadata = this.doc.getMap('metadata')
      
      // Set up WebRTC provider (peer-to-peer connection)
      this.provider = new WebrtcProvider(this.roomId, this.doc, {
        signaling: ['wss://signaling.yjs.dev'] // Public signaling server
      })
      
      // Set up persistence to IndexedDB
      this.persistence = new IndexeddbPersistence(this.roomId, this.doc)
      
      // Get the awareness instance for tracking users
      this.awareness = this.provider.awareness
      
      // Create local user with random color
      const colors = ['#e11d48', '#f59e0b', '#0ea5e9', '#10b981', '#8b5cf6']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      this.localUser = {
        id: this.doc.clientID.toString(),
        name: userName,
        color: randomColor
      }
      
      // Set awareness state
      this.awareness.setLocalState({
        user: this.localUser,
        cursor: null,
        selection: null,
        activeTab: 'vector'
      })
      
      // Listen for awareness changes
      this.awareness.on('change', this.handleAwarenessChange.bind(this))
      
      // Listen for document changes
      this.vectorData.observe(this.handleDocumentChange.bind(this))
      this.rasterData.observe(this.handleDocumentChange.bind(this))
      this.textData.observe(this.handleDocumentChange.bind(this))
      this.metadata.observe(this.handleDocumentChange.bind(this))
      
      // Generate share URL
      const shareUrl = `${window.location.origin}/browser-design-studio?collaborate=${this.roomId}`
      
      // Notify state change
      this.notifyStateChange({
        isCollaborating: true,
        roomId: this.roomId,
        users: this.getUsers(),
        localUser: this.localUser,
        shareUrl,
        error: null
      })
      
      // Notify about the initial document data
      this.notifyDocumentChange()
      
      return true
    } catch (error) {
      console.error('Error joining collaboration:', error)
      
      // Notify error
      this.notifyStateChange({
        isCollaborating: false,
        roomId: null,
        users: [],
        localUser: null,
        shareUrl: null,
        error: 'Failed to join collaboration session'
      })
      
      return false
    }
  }

  // End the collaboration session
  endCollaboration(): void {
    try {
      // Clean up listeners
      if (this.awareness) {
        this.awareness.off('change', this.handleAwarenessChange.bind(this))
      }
      
      if (this.vectorData) {
        this.vectorData.unobserve(this.handleDocumentChange.bind(this))
      }
      
      if (this.rasterData) {
        this.rasterData.unobserve(this.handleDocumentChange.bind(this))
      }
      
      if (this.textData) {
        this.textData.unobserve(this.handleDocumentChange.bind(this))
      }
      
      if (this.metadata) {
        this.metadata.unobserve(this.handleDocumentChange.bind(this))
      }
      
      // Destroy providers
      if (this.provider) {
        this.provider.destroy()
      }
      
      if (this.persistence) {
        this.persistence.destroy()
      }
      
      // Reset state
      this.doc = null
      this.vectorData = null
      this.rasterData = null
      this.textData = null
      this.metadata = null
      this.awareness = null
      this.provider = null
      this.persistence = null
      this.roomId = null
      
      // Notify state change
      this.notifyStateChange({
        isCollaborating: false,
        roomId: null,
        users: [],
        localUser: null,
        shareUrl: null,
        error: null
      })
    } catch (error) {
      console.error('Error ending collaboration:', error)
    }
  }

  // Update the vector data
  updateVectorData(data: any): void {
    if (!this.vectorData || !this.doc) return
    
    this.doc.transact(() => {
      // Clear existing data
      this.vectorData!.forEach((_, key) => {
        this.vectorData!.delete(key)
      })
      
      // Set new data
      Object.entries(data).forEach(([key, value]) => {
        this.vectorData!.set(key, value)
      })
    })
  }

  // Update the raster data
  updateRasterData(data: any): void {
    if (!this.rasterData || !this.doc) return
    
    this.doc.transact(() => {
      // Clear existing data
      this.rasterData!.forEach((_, key) => {
        this.rasterData!.delete(key)
      })
      
      // Set new data
      Object.entries(data).forEach(([key, value]) => {
        this.rasterData!.set(key, value)
      })
    })
  }

  // Update the text data
  updateTextData(data: any): void {
    if (!this.textData || !this.doc) return
    
    this.doc.transact(() => {
      // Clear existing data
      this.textData!.forEach((_, key) => {
        this.textData!.delete(key)
      })
      
      // Set new data
      Object.entries(data).forEach(([key, value]) => {
        this.textData!.set(key, value)
      })
    })
  }

  // Update document metadata
  updateMetadata(data: any): void {
    if (!this.metadata || !this.doc) return
    
    this.doc.transact(() => {
      // Set new metadata
      Object.entries(data).forEach(([key, value]) => {
        this.metadata!.set(key, value)
      })
    })
  }

  // Update cursor position
  updateCursor(position: { x: number; y: number } | null): void {
    if (!this.awareness || !this.localUser) return
    
    const currentState = this.awareness.getLocalState() || {}
    
    this.awareness.setLocalState({
      ...currentState,
      cursor: position
    })
  }

  // Update selection
  updateSelection(selection: string[]): void {
    if (!this.awareness || !this.localUser) return
    
    const currentState = this.awareness.getLocalState() || {}
    
    this.awareness.setLocalState({
      ...currentState,
      selection
    })
  }

  // Update active tab
  updateActiveTab(tab: string): void {
    if (!this.awareness || !this.localUser) return
    
    const currentState = this.awareness.getLocalState() || {}
    
    this.awareness.setLocalState({
      ...currentState,
      activeTab: tab
    })
  }

  // Get current users from awareness
  getUsers(): CollaborationUser[] {
    if (!this.awareness) return []
    
    const users: CollaborationUser[] = []
    this.awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.user) {
        users.push({
          ...state.user,
          cursor: state.cursor,
          selection: state.selection,
          activeTab: state.activeTab
        })
      }
    })
    
    return users
  }

  // Handle awareness changes (users joining/leaving, cursor updates)
  private handleAwarenessChange(): void {
    if (!this.awareness) return
    
    // Notify state change with updated users
    this.notifyStateChange({
      isCollaborating: true,
      roomId: this.roomId,
      users: this.getUsers(),
      localUser: this.localUser,
      shareUrl: `${window.location.origin}/browser-design-studio?collaborate=${this.roomId}`,
      error: null
    })
  }

  // Handle document changes
  private handleDocumentChange(): void {
    this.notifyDocumentChange()
  }

  // Subscribe to state changes
  onStateChange(callback: (state: CollaborationState) => void): void {
    this.onStateChangeCallbacks.push(callback)
  }

  // Subscribe to document changes
  onDocumentChange(callback: (data: DocumentData) => void): void {
    this.onDocumentChangeCallbacks.push(callback)
  }

  // Notify all subscribers about state changes
  private notifyStateChange(state: CollaborationState): void {
    this.onStateChangeCallbacks.forEach(callback => callback(state))
  }

  // Notify all subscribers about document changes
  private notifyDocumentChange(): void {
    if (!this.vectorData || !this.rasterData || !this.textData || !this.metadata) return
    
    // Convert Yjs maps to plain JavaScript objects
    const vectorObj: any = {}
    this.vectorData.forEach((value, key) => {
      vectorObj[key] = value
    })
    
    const rasterObj: any = {}
    this.rasterData.forEach((value, key) => {
      rasterObj[key] = value
    })
    
    const textObj: any = {}
    this.textData.forEach((value, key) => {
      textObj[key] = value
    })
    
    const metadataObj: any = {}
    this.metadata.forEach((value, key) => {
      metadataObj[key] = value
    })
    
    const data: DocumentData = {
      vector: vectorObj,
      raster: rasterObj,
      text: textObj,
      metadata: {
        name: metadataObj.name || 'Untitled Design',
        dimensions: metadataObj.dimensions || { width: 1200, height: 800 },
        lastModified: metadataObj.lastModified || new Date()
      }
    }
    
    this.onDocumentChangeCallbacks.forEach(callback => callback(data))
  }
}

// Export a singleton instance
export const collaborationService = new CollaborationService()

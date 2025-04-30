'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useVectorStore } from './stores/vector-store'
import { useRasterStore } from './stores/raster-store'
import { useTextStore } from './stores/text-store'

// Type for our context
interface DesignStudioContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
  documentName: string
  setDocumentName: (name: string) => void
  documentDimensions: { width: number; height: number }
  setDocumentDimensions: (dimensions: { width: number; height: number }) => void
  isLoading: boolean
  lastSaved: Date | null
  saveDocument: () => Promise<void>
  loadDocument: (documentId: string) => Promise<void>
  resetDocument: () => void
  documents: Array<{ id: string; name: string; lastModified: Date }>
}

// Create context
const DesignStudioContext = createContext<DesignStudioContextType | null>(null)

// Provider component
export function DesignStudioProvider({ children }: { children: React.ReactNode }) {
  // Local state for document management
  const [activeTab, setActiveTab] = useState('vector')
  const [documentName, setDocumentName] = useState('Untitled Design')
  const [documentDimensions, setDocumentDimensions] = useState({ width: 1200, height: 800 })
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; lastModified: Date }>>([])

  // Get store actions
  const { 
    paths: vectorPaths, 
    addPath: addVectorPath, 
    clearPaths: clearVectorPaths,
    getState: getVectorState,
    setState: setVectorState
  } = useVectorStore()

  const {
    layers: rasterLayers,
    addLayer: addRasterLayer,
    clearLayers: clearRasterLayers,
    getState: getRasterState,
    setState: setRasterState
  } = useRasterStore()

  const {
    textNodes,
    addTextNode,
    clearTextNodes,
    getState: getTextState,
    setState: setTextState
  } = useTextStore()

  // Load document list on mount
  useEffect(() => {
    loadDocumentList()
    
    // Set up auto-save interval
    const autoSaveInterval = setInterval(() => {
      saveDocument()
    }, 30000) // Every 30 seconds
    
    return () => clearInterval(autoSaveInterval)
  }, [])

  // Load the list of documents from IndexedDB
  const loadDocumentList = async () => {
    try {
      // In a real implementation, this would load from IndexedDB
      // For now, we'll simulate with some dummy data
      setDocuments([
        { id: 'doc1', name: 'Sample Logo Design', lastModified: new Date(Date.now() - 86400000) },
        { id: 'doc2', name: 'Website Banner', lastModified: new Date(Date.now() - 172800000) },
        { id: 'doc3', name: 'Product Mockup', lastModified: new Date() }
      ])
    } catch (error) {
      console.error('Error loading document list:', error)
    }
  }

  // Save the current document to IndexedDB
  const saveDocument = async () => {
    try {
      setIsLoading(true)
      
      // Create a document object that combines all store states
      const documentData = {
        id: crypto.randomUUID(),
        name: documentName,
        dimensions: documentDimensions,
        vector: getVectorState(),
        raster: getRasterState(),
        text: getTextState(),
        lastModified: new Date()
      }
      
      // In a real implementation, save to IndexedDB
      console.log('Saving document:', documentData)
      
      // Update last saved timestamp
      setLastSaved(new Date())
      setIsLoading(false)
      
      return
    } catch (error) {
      console.error('Error saving document:', error)
      setIsLoading(false)
    }
  }

  // Load a document from IndexedDB
  const loadDocument = async (documentId: string) => {
    try {
      setIsLoading(true)
      
      // In a real implementation, load from IndexedDB
      // For demo, we'll simulate loading with a timeout
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate loaded data
      const mockDocument = {
        id: documentId,
        name: documents.find(doc => doc.id === documentId)?.name || 'Loaded Document',
        dimensions: { width: 1200, height: 800 },
        vector: { paths: [], selectedPathIds: [] },
        raster: { layers: [], activeLayerId: null },
        text: { textNodes: [], selectedNodeIds: [] },
        lastModified: new Date()
      }
      
      // Update all stores with loaded data
      setDocumentName(mockDocument.name)
      setDocumentDimensions(mockDocument.dimensions)
      setVectorState(mockDocument.vector)
      setRasterState(mockDocument.raster)
      setTextState(mockDocument.text)
      
      setIsLoading(false)
      return
    } catch (error) {
      console.error('Error loading document:', error)
      setIsLoading(false)
    }
  }

  // Reset document to a new empty state
  const resetDocument = () => {
    setDocumentName('Untitled Design')
    setDocumentDimensions({ width: 1200, height: 800 })
    clearVectorPaths()
    clearRasterLayers()
    clearTextNodes()
    setLastSaved(null)
  }

  const value = {
    activeTab,
    setActiveTab,
    documentName,
    setDocumentName,
    documentDimensions,
    setDocumentDimensions,
    isLoading,
    lastSaved,
    saveDocument,
    loadDocument,
    resetDocument,
    documents
  }

  return (
    <DesignStudioContext.Provider value={value}>
      {children}
    </DesignStudioContext.Provider>
  )
}

// Custom hook to use the context
export function useDesignStudio() {
  const context = useContext(DesignStudioContext)
  if (context === null) {
    throw new Error('useDesignStudio must be used within a DesignStudioProvider')
  }
  return context
}

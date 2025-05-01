import { create } from 'zustand'

export interface RasterLayer {
  id: string
  name: string
  visible: boolean
  opacity: number
  blendMode: string
  imageData: ImageData | null
}

interface RasterState {
  layers: RasterLayer[]
  activeLayerIndex: number | null
  history: ImageData[]
  addLayer: (layer: RasterLayer) => void
  updateLayer: (index: number, layer: Partial<RasterLayer>) => void
  deleteLayer: (index: number) => void
  setActiveLayerIndex: (index: number | null) => void
  moveLayer: (fromIndex: number, toIndex: number) => void
  pushHistory: (imageData: ImageData) => void
  undo: () => void
  getLayers: () => RasterLayer[]
  loadImageData: (imageData: ImageData, options?: { layerName?: string }) => void
  saveState: () => { layers: RasterLayer[] }
  restoreState: (state: { layers: RasterLayer[] }) => void
}

export const useRasterStore = create<RasterState>((set, get) => ({
  layers: [],
  activeLayerIndex: null,
  history: [],

  addLayer: (layer) => set((state) => {
    const newLayers = [...state.layers, layer]
    return { 
      layers: newLayers,
      activeLayerIndex: newLayers.length - 1
    }
  }),

  updateLayer: (index, updatedLayerData) => set((state) => ({
    layers: state.layers.map((layer, i) => 
      i === index 
        ? { ...layer, ...updatedLayerData } 
        : layer
    )
  })),

  deleteLayer: (index) => set((state) => {
    const newLayers = [...state.layers]
    newLayers.splice(index, 1)
    
    let newActiveLayerIndex = state.activeLayerIndex
    
    // Update the active layer index if necessary
    if (newLayers.length === 0) {
      newActiveLayerIndex = null
    } else if (state.activeLayerIndex !== null) {
      // If deleting the active layer or a layer before it
      if (index <= state.activeLayerIndex) {
        newActiveLayerIndex = Math.max(0, state.activeLayerIndex - 1)
      }
    }
    
    return {
      layers: newLayers,
      activeLayerIndex: newActiveLayerIndex
    }
  }),

  setActiveLayerIndex: (index) => set({ activeLayerIndex: index }),

  moveLayer: (fromIndex, toIndex) => set((state) => {
    const newLayers = [...state.layers]
    const [movedLayer] = newLayers.splice(fromIndex, 1)
    newLayers.splice(toIndex, 0, movedLayer)
    
    let newActiveLayerIndex = state.activeLayerIndex
    
    // Update active layer index to follow the moved layer
    if (state.activeLayerIndex === fromIndex) {
      newActiveLayerIndex = toIndex
    } 
    // Or adjust the active layer index if it was affected by the move
    else if (state.activeLayerIndex !== null) {
      if (fromIndex < state.activeLayerIndex && toIndex >= state.activeLayerIndex) {
        newActiveLayerIndex = state.activeLayerIndex - 1
      } else if (fromIndex > state.activeLayerIndex && toIndex <= state.activeLayerIndex) {
        newActiveLayerIndex = state.activeLayerIndex + 1
      }
    }
    
    return {
      layers: newLayers,
      activeLayerIndex: newActiveLayerIndex
    }
  }),

  pushHistory: (imageData) => set((state) => ({
    history: [...state.history, imageData]
  })),

  undo: () => set((state) => {
    if (state.history.length === 0 || state.activeLayerIndex === null) {
      return state
    }
    
    const lastHistoryItem = state.history[state.history.length - 1]
    const newHistory = state.history.slice(0, -1)
    
    const newLayers = [...state.layers]
    if (newLayers[state.activeLayerIndex]) {
      newLayers[state.activeLayerIndex] = {
        ...newLayers[state.activeLayerIndex],
        imageData: lastHistoryItem
      }
    }
    
    return {
      layers: newLayers,
      history: newHistory
    }
  }),

  getLayers: () => get().layers,

  loadImageData: (imageData, options = {}) => {
    const { layerName = 'Imported Layer' } = options
    const newLayer: RasterLayer = {
      id: 'layer-' + Date.now(),
      name: layerName,
      visible: true, 
      opacity: 1.0,
      blendMode: 'normal',
      imageData
    }
    get().addLayer(newLayer)
  },
  
  // Added for state persistence and restoration
  saveState: () => {
    const { layers } = get()
    return { layers }
  },
  
  restoreState: (state) => set({ 
    layers: state.layers || [],
    activeLayerIndex: state.layers?.length > 0 ? 0 : null
  })
}))

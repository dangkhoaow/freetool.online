import { create } from 'zustand'

interface TextPosition {
  x: number
  y: number
}

interface TextPathData {
  type: 'arc' | 'line' | 'custom'
  radius?: number
  startAngle?: number
  endAngle?: number
  points?: TextPosition[]
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  textDecoration: string
  color: string
  lineHeight: number
  letterSpacing: number
  textAlign: string
}

export interface TextNode {
  id: string
  text: string
  style: TextStyle
  position: TextPosition
  onPath: boolean
  pathData?: TextPathData
  // Direct properties for SVG export
  x?: number
  y?: number
  fontFamily?: string
  fontSize?: number
  fill?: string
  fontWeight?: string
  fontStyle?: string
  opacity?: number
}

interface TextState {
  textNodes: TextNode[]
  selectedNodeId: string | null
  addTextNode: (node: TextNode) => void
  updateTextNode: (id: string, node: Partial<TextNode>) => void
  removeTextNode: (id: string) => void
  setSelectedNodeId: (id: string | null) => void
  getLayers: () => TextNode[]
  saveState: () => any
  restoreState: (state: any) => void
}

export const useTextStore = create<TextState>((set, get) => ({
  textNodes: [],
  selectedNodeId: null,

  addTextNode: (node) => set((state) => ({
    textNodes: [...state.textNodes, node]
  })),

  updateTextNode: (id, updatedNode) => set((state) => ({
    textNodes: state.textNodes.map((node) => 
      node.id === id 
        ? { ...node, ...updatedNode } 
        : node
    )
  })),

  removeTextNode: (id) => set((state) => ({
    textNodes: state.textNodes.filter((node) => node.id !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  getLayers: () => get().textNodes,

  saveState: () => {
    const { textNodes } = get()
    return { textNodes }
  },

  restoreState: (state) => set({ 
    textNodes: state.textNodes || [] 
  })
}))

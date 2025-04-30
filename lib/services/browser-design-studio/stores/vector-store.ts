import { create } from 'zustand'

interface Point {
  x: number
  y: number
}

export interface PathData {
  id: string
  points: Point[]
  strokeColor: string
  strokeWidth: number
  fill: string
  closed: boolean
}

interface VectorState {
  paths: PathData[]
  selectedPathId: string | null
  addPath: (path: PathData) => void
  updatePath: (id: string, path: Partial<PathData>) => void
  deletePath: (id: string) => void
  clearPaths: () => void
  setSelectedPathId: (id: string | null) => void
  getLayers: () => PathData[]
  saveState: () => any
  restoreState: (state: any) => void
}

export const useVectorStore = create<VectorState>((set, get) => ({
  paths: [],
  selectedPathId: null,

  addPath: (path) => set((state) => ({ 
    paths: [...state.paths, path] 
  })),

  updatePath: (id, updatedPathData) => set((state) => ({
    paths: state.paths.map((path) => 
      path.id === id 
        ? { ...path, ...updatedPathData } 
        : path
    )
  })),

  deletePath: (id) => set((state) => ({
    paths: state.paths.filter((path) => path.id !== id),
    selectedPathId: state.selectedPathId === id ? null : state.selectedPathId
  })),

  clearPaths: () => set({ paths: [], selectedPathId: null }),

  setSelectedPathId: (id) => set({ selectedPathId: id }),

  getLayers: () => get().paths,

  saveState: () => {
    const { paths } = get()
    return { paths }
  },

  restoreState: (state) => set({ 
    paths: state.paths || [] 
  })
}))

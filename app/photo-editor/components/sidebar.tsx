"use client"

import type React from "react"
import type { SidebarPanel } from "./photo-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Layer } from "@/lib/services/photo-editor-service"

import LayersPanel from "./panels/layers-panel"
import AdjustmentsPanel from "./panels/adjustments-panel"
import FiltersPanel from "./panels/filters-panel"
import TextPanel from "./panels/text-panel"
import DrawingPanel from "./panels/drawing-panel"
import BorderPanel from "./panels/border-panel"
import ExportPanel from "./panels/export-panel"

// Update the Sidebar props interface
interface SidebarProps {
  currentPanel: SidebarPanel
  setCurrentPanel: (panel: SidebarPanel) => void
  layers: Layer[]
  activeLayerId: string | null
  setActiveLayerId: (id: string) => void
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void
  onAddLayer: () => void
  onDeleteLayer: () => void
  onUploadImage: () => void
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function Sidebar({
  currentPanel,
  setCurrentPanel,
  layers,
  activeLayerId,
  setActiveLayerId,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
  onUploadImage,
  canvasRef,
}: SidebarProps) {
  return (
    <div className="w-72 bg-slate-50 dark:bg-slate-900 border-l">
      <Tabs
        defaultValue="layers"
        value={currentPanel}
        onValueChange={(value) => setCurrentPanel(value as SidebarPanel)}
        className="h-full flex flex-col"
      >
        <TabsList className="grid grid-cols-7 h-12 rounded-none bg-slate-100 dark:bg-slate-800 px-2">
          <TabsTrigger value="layers" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Layers</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              <path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.99 12.5" />
              <path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.99 17.5" />
            </svg>
          </TabsTrigger>
          <TabsTrigger
            value="adjustments"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700"
          >
            <span className="sr-only">Adjustments</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 2v8" />
              <path d="m4.93 10.93 1.41 1.41" />
              <path d="M2 18h2" />
              <path d="M20 18h2" />
              <path d="m19.07 10.93-1.41 1.41" />
              <path d="M22 22H2" />
              <path d="m16 8-4 4-4-4" />
              <path d="M16 18a4 4 0 0 0-8 0" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="filters" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Filters</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Text</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M17 6.1H3" />
              <path d="M21 12.1H3" />
              <path d="M15.1 18H3" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="drawing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Drawing</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="border" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Border</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect width="16" height="16" x="4" y="4" rx="2" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
            <span className="sr-only">Export</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="flex-1 p-0 m-0 overflow-auto">
          <LayersPanel
            layers={layers}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
            onUpdateLayer={onUpdateLayer}
            onAddLayer={onAddLayer}
            onDeleteLayer={onDeleteLayer}
            onUploadImage={onUploadImage}
          />
        </TabsContent>

        <TabsContent value="adjustments" className="flex-1 p-0 m-0 overflow-auto">
          <AdjustmentsPanel layers={layers} activeLayerId={activeLayerId} onUpdateLayer={onUpdateLayer} />
        </TabsContent>

        <TabsContent value="filters" className="flex-1 p-0 m-0 overflow-auto">
          <FiltersPanel layers={layers} activeLayerId={activeLayerId} onUpdateLayer={onUpdateLayer} />
        </TabsContent>

        <TabsContent value="text" className="flex-1 p-0 m-0 overflow-auto">
          <TextPanel layers={layers} activeLayerId={activeLayerId} onUpdateLayer={onUpdateLayer} />
        </TabsContent>

        <TabsContent value="drawing" className="flex-1 p-0 m-0 overflow-auto">
          <DrawingPanel layers={layers} activeLayerId={activeLayerId} onUpdateLayer={onUpdateLayer} />
        </TabsContent>

        <TabsContent value="border" className="flex-1 p-0 m-0 overflow-auto">
          <BorderPanel layers={layers} activeLayerId={activeLayerId} onUpdateLayer={onUpdateLayer} />
        </TabsContent>

        <TabsContent value="export" className="flex-1 p-0 m-0 overflow-auto">
          <ExportPanel canvasRef={canvasRef} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

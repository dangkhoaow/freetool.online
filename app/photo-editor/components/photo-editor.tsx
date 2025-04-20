"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Toolbar from "./toolbar"
import CanvasArea from "./canvas-area"
import Sidebar from "./sidebar"
import { Button } from "@/components/ui/button"
import {
  type Layer,
  HistoryManager,
  DEFAULT_ADJUSTMENTS,
  imageToBase64,
  loadImage,
} from "@/lib/services/photo-editor-service"
import { v4 as uuidv4 } from "uuid"
import KeyboardShortcutsModal from "./keyboard-shortcuts-modal"
import NewCanvasModal from "./new-canvas-modal"

export type EditorTool =
  | "move"
  | "selection"
  | "magicWand"
  | "brush"
  | "eraser"
  | "text"
  | "shape"
  | "crop"
  | "eyedropper"
  | "hand"
  | "upload"

export type SidebarPanel = "layers" | "adjustments" | "filters" | "text" | "drawing" | "border" | "export"

export default function PhotoEditor() {
  const [currentTool, setCurrentTool] = useState<EditorTool>("move")
  const [currentPanel, setCurrentPanel] = useState<SidebarPanel>("layers")
  const [layers, setLayers] = useState<Layer[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null)
  const [canvasWidth, setCanvasWidth] = useState(1920)
  const [canvasHeight, setCanvasHeight] = useState(1080)
  const [scale, setScale] = useState(0.5)
  const [isShowingShortcuts, setIsShowingShortcuts] = useState(false)
  const [isShowingNewCanvas, setIsShowingNewCanvas] = useState(false)

  const historyManager = useRef(new HistoryManager())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Create a new document
  const handleNewDocument = (width: number, height: number, transparent = true) => {
    setCanvasWidth(width)
    setCanvasHeight(height)
    setLayers([])

    // If not transparent, create a background layer
    if (!transparent) {
      const backgroundLayer: Layer = {
        id: uuidv4(),
        name: "Background",
        type: "image",
        visible: true,
        locked: false,
        opacity: 100,
        data: null, // Will be set by renderCanvas
        position: { x: 0, y: 0 },
        width,
        height,
        rotation: 0,
        filters: [...DEFAULT_ADJUSTMENTS],
        blendMode: "normal",
      }

      // Create a white background image
      const bgCanvas = document.createElement("canvas")
      bgCanvas.width = width
      bgCanvas.height = height
      const bgCtx = bgCanvas.getContext("2d")

      if (bgCtx) {
        bgCtx.fillStyle = "#ffffff"
        bgCtx.fillRect(0, 0, width, height)

        // Convert to image
        const bgImage = new Image()
        bgImage.src = bgCanvas.toDataURL("image/png")
        bgImage.onload = () => {
          backgroundLayer.data = bgImage
          setLayers([backgroundLayer])
          setActiveLayerId(backgroundLayer.id)
        }
      } else {
        setLayers([backgroundLayer])
        setActiveLayerId(backgroundLayer.id)
      }
    }

    setScale(0.5)
  }

  // Add a new layer
  const handleAddLayer = (type: Layer["type"] = "image") => {
    const newLayer: Layer = {
      id: uuidv4(),
      name: `Layer ${layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      data: null,
      position: { x: 0, y: 0 },
      width: canvasWidth,
      height: canvasHeight,
      rotation: 0,
      filters: [...DEFAULT_ADJUSTMENTS],
      blendMode: "normal",
    }

    setLayers((prev) => [...prev, newLayer])
    setActiveLayerId(newLayer.id)

    historyManager.current.push({
      type: "ADD_LAYER",
      payload: { layer: newLayer },
      undo: () => {
        setLayers((layers) => layers.filter((l) => l.id !== newLayer.id))
        setActiveLayerId(layers.length > 0 ? layers[layers.length - 1].id : null)
      },
      redo: () => {
        setLayers((layers) => [...layers, newLayer])
        setActiveLayerId(newLayer.id)
      },
    })
  }

  // Delete the active layer
  const handleDeleteLayer = () => {
    if (!activeLayerId) return

    const layerIndex = layers.findIndex((l) => l.id === activeLayerId)
    if (layerIndex === -1) return

    const deletedLayer = layers[layerIndex]

    setLayers((prev) => prev.filter((l) => l.id !== activeLayerId))
    setActiveLayerId(layers.length > 1 ? layers[layerIndex - 1]?.id || layers[layerIndex + 1]?.id : null)

    historyManager.current.push({
      type: "DELETE_LAYER",
      payload: { layer: deletedLayer, index: layerIndex },
      undo: () => {
        setLayers((layers) => {
          const newLayers = [...layers]
          newLayers.splice(layerIndex, 0, deletedLayer)
          return newLayers
        })
        setActiveLayerId(deletedLayer.id)
      },
      redo: () => {
        setLayers((layers) => layers.filter((l) => l.id !== deletedLayer.id))
        setActiveLayerId(layers.length > 0 ? layers[layerIndex - 1]?.id || layers[layerIndex + 1]?.id : null)
      },
    })
  }

  // Update a layer's properties
  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    const layerIndex = layers.findIndex((l) => l.id === id)
    if (layerIndex === -1) return

    const oldLayer = layers[layerIndex]

    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)))

    historyManager.current.push({
      type: "UPDATE_LAYER",
      payload: { id, updates },
      undo: () => {
        setLayers((layers) => layers.map((layer) => (layer.id === id ? oldLayer : layer)))
      },
      redo: () => {
        setLayers((layers) => layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)))
      },
    })
  }

  // Handle zooming
  const handleZoom = (zoomIn: boolean) => {
    setScale((prev) => {
      const newScale = zoomIn ? prev * 1.2 : prev / 1.2
      return Math.max(0.1, Math.min(5, newScale))
    })
  }

  // Handle undo
  const handleUndo = () => {
    if (historyManager.current.canUndo()) {
      historyManager.current.undo()
    }
  }

  // Handle redo
  const handleRedo = () => {
    if (historyManager.current.canRedo()) {
      historyManager.current.redo()
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    try {
      const file = e.target.files[0]
      const imageBase64 = await imageToBase64(file)
      const imageElement = await loadImage(imageBase64)

      // Calculate proportional dimensions to fit within canvas
      let width = imageElement.width
      let height = imageElement.height

      if (width > canvasWidth) {
        const ratio = canvasWidth / width
        width = canvasWidth
        height = height * ratio
      }

      if (height > canvasHeight) {
        const ratio = canvasHeight / height
        height = height * ratio
        width = width * ratio
      }

      // Position in the center of the canvas
      const x = (canvasWidth - width) / 2
      const y = (canvasHeight - height) / 2

      const newLayer: Layer = {
        id: uuidv4(),
        name: `Image ${file.name.split(".")[0]}`,
        type: "image",
        visible: true,
        locked: false,
        opacity: 100,
        data: imageElement,
        position: { x, y },
        width,
        height,
        rotation: 0,
        filters: [...DEFAULT_ADJUSTMENTS],
        blendMode: "normal",
      }

      setLayers((prev) => [...prev, newLayer])
      setActiveLayerId(newLayer.id)

      historyManager.current.push({
        type: "ADD_LAYER",
        payload: { layer: newLayer },
        undo: () => {
          setLayers((layers) => layers.filter((l) => l.id !== newLayer.id))
          setActiveLayerId(layers.length > 0 ? layers[layers.length - 1].id : null)
        },
        redo: () => {
          setLayers((layers) => [...layers, newLayer])
          setActiveLayerId(newLayer.id)
        },
      })

      // Reset the input to allow uploading the same file again
      e.target.value = ""
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")

      // Reset the input
      e.target.value = ""
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break

          case "y":
            e.preventDefault()
            handleRedo()
            break

          case "+":
          case "=":
            e.preventDefault()
            handleZoom(true)
            break

          case "-":
            e.preventDefault()
            handleZoom(false)
            break

          case "n":
            e.preventDefault()
            setIsShowingNewCanvas(true)
            break

          case "?":
            e.preventDefault()
            setIsShowingShortcuts(true)
            break
        }
      } else {
        // Single key shortcuts
        switch (e.key.toLowerCase()) {
          case "v":
            e.preventDefault()
            setCurrentTool("move")
            break

          case "m":
            e.preventDefault()
            setCurrentTool("selection")
            break

          case "w":
            e.preventDefault()
            setCurrentTool("magicWand")
            break

          case "b":
            e.preventDefault()
            setCurrentTool("brush")
            break

          case "e":
            e.preventDefault()
            setCurrentTool("eraser")
            break

          case "t":
            e.preventDefault()
            setCurrentTool("text")
            break

          case "c":
            e.preventDefault()
            setCurrentTool("crop")
            break

          case "i":
            e.preventDefault()
            setCurrentTool("eyedropper")
            break

          case "h":
            e.preventDefault()
            setCurrentTool("hand")
            break

          case "?":
            e.preventDefault()
            setIsShowingShortcuts(true)
            break

          case "delete":
          case "backspace":
            e.preventDefault()
            if (activeLayerId) {
              handleDeleteLayer()
            }
            break

          case "u":
            e.preventDefault()
            document.getElementById("image-upload")?.click()
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeLayerId, layers])

  // Ask before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (layers.length > 0) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [layers])

  // Add a helper function to trigger the image upload dialog
  const triggerImageUpload = () => {
    document.getElementById("image-upload")?.click()
  }

  return (
    <div className="flex flex-col h-[800px] rounded-lg border shadow-sm overflow-hidden">
      <div className="bg-slate-950 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800"
            onClick={() => setIsShowingNewCanvas(true)}
          >
            File
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800" onClick={handleUndo}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-800"
            onClick={() => setIsShowingShortcuts(true)}
          >
            Help
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(false)}
            className="text-white hover:bg-slate-800 bg-slate-900"
          >
            -
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(true)}
            className="text-white hover:bg-slate-800 bg-slate-900"
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          canDeleteLayer={!!activeLayerId}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyManager.current.canUndo()}
          canRedo={historyManager.current.canRedo()}
          onUploadImage={handleImageUpload}
        />

        <CanvasArea
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          scale={scale}
          layers={layers}
          activeLayerId={activeLayerId}
          setActiveLayerId={setActiveLayerId}
          currentTool={currentTool}
          onUpdateLayer={handleUpdateLayer}
        />

        <Sidebar
          currentPanel={currentPanel}
          setCurrentPanel={setCurrentPanel}
          layers={layers}
          activeLayerId={activeLayerId}
          setActiveLayerId={setActiveLayerId}
          onUpdateLayer={handleUpdateLayer}
          onAddLayer={handleAddLayer}
          onDeleteLayer={handleDeleteLayer}
          onUploadImage={triggerImageUpload}
          canvasRef={canvasRef}
        />
      </div>

      <KeyboardShortcutsModal isOpen={isShowingShortcuts} onClose={() => setIsShowingShortcuts(false)} />

      <NewCanvasModal
        isOpen={isShowingNewCanvas}
        onClose={() => setIsShowingNewCanvas(false)}
        onCreateCanvas={handleNewDocument}
      />
    </div>
  )
}

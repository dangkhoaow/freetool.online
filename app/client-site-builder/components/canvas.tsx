"use client"

import { useState, useEffect, useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { UIBlock } from "./site-builder-tool"
import { cn } from "@/lib/utils"

interface DraggableBlockProps {
  block: UIBlock
  index: number
  moveBlock: (dragIndex: number, hoverIndex: number) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, updatedBlock: UIBlock) => void
}

const DraggableBlock = ({ 
  block, 
  index, 
  moveBlock, 
  onSelect, 
  onDelete, 
  onUpdate 
}: DraggableBlockProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag({
    type: "BLOCK",
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: "BLOCK",
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return
      
      const dragIndex = item.index
      const hoverIndex = index
      
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
      
      moveBlock(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  // Render different components based on block type
  const renderBlockContent = () => {
    switch (block.type) {
      case "hero":
        return (
          <div 
            className={cn(
              "min-h-[300px] flex items-center justify-center p-8",
              isDragging ? "opacity-50" : "opacity-100"
            )}
            style={block.styles as React.CSSProperties}
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Your Website Title</h1>
              <p className="text-xl mb-6">A compelling subtitle that explains your value proposition</p>
              <div className="flex justify-center gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded">Get Started</button>
                <button className="border border-gray-300 px-6 py-2 rounded">Learn More</button>
              </div>
            </div>
          </div>
        )
      
      case "features":
        return (
          <div 
            className={cn(
              "py-12 px-4",
              isDragging ? "opacity-50" : "opacity-100"
            )}
            style={block.styles as React.CSSProperties}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Features</h2>
              <p className="max-w-2xl mx-auto">Our amazing features that make us stand out from the crowd</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Feature {i}</h3>
                  <p>A short description of this amazing feature and why it matters.</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "testimonials":
        return (
          <div 
            className={cn(
              "py-12 px-4 bg-gray-50",
              isDragging ? "opacity-50" : "opacity-100"
            )}
            style={block.styles as React.CSSProperties}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Testimonials</h2>
              <p className="max-w-2xl mx-auto">What our customers say about us</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-medium">Customer Name</h4>
                      <p className="text-sm text-gray-500">Position, Company</p>
                    </div>
                  </div>
                  <p className="italic">"This product has completely transformed how we work. The features are incredible and the support team is top-notch."</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case "contact":
        return (
          <div 
            className={cn(
              "py-12 px-4",
              isDragging ? "opacity-50" : "opacity-100"
            )}
            style={block.styles as React.CSSProperties}
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
                <p>Get in touch with our team</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1">Name</label>
                      <input type="text" className="w-full border p-2 rounded" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block mb-1">Email</label>
                      <input type="email" className="w-full border p-2 rounded" placeholder="Your email" />
                    </div>
                    <div>
                      <label className="block mb-1">Message</label>
                      <textarea className="w-full border p-2 rounded h-32" placeholder="Your message"></textarea>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded">Send Message</button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <p>123 Street Name, City, Country</p>
                    <p>info@yourcompany.com</p>
                    <p>+1 (123) 456-7890</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div 
            className={cn(
              "min-h-[100px] flex items-center justify-center p-4 border-2 border-dashed border-gray-300",
              isDragging ? "opacity-50" : "opacity-100"
            )}
          >
            <p>Unknown block type: {block.type}</p>
          </div>
        )
    }
  }

  return (
    <div 
      ref={ref} 
      className={cn(
        "relative group mb-4 rounded cursor-move",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(block.id)
      }}
    >
      {renderBlockContent()}
      
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
        <button
          className="bg-white dark:bg-gray-800 p-1 rounded shadow hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(block.id)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          </svg>
        </button>
        <button
          className="bg-white dark:bg-gray-800 p-1 rounded shadow hover:bg-gray-100 text-red-500"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(block.id)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

interface CanvasProps {
  blocks: UIBlock[]
  canvasMode: "desktop" | "tablet" | "mobile"
  onBlocksChange: (blocks: UIBlock[]) => void
  onBlockSelect: (blockId: string) => void
}

export default function Canvas({ 
  blocks, 
  canvasMode,
  onBlocksChange, 
  onBlockSelect 
}: CanvasProps) {
  const [localBlocks, setLocalBlocks] = useState<UIBlock[]>(blocks)
  
  // Update local blocks when props change
  useEffect(() => {
    setLocalBlocks(blocks)
  }, [blocks])

  // Move block handler for drag and drop
  const moveBlock = (dragIndex: number, hoverIndex: number) => {
    const draggedBlock = localBlocks[dragIndex]
    const updatedBlocks = [...localBlocks]
    
    updatedBlocks.splice(dragIndex, 1)
    updatedBlocks.splice(hoverIndex, 0, draggedBlock)
    
    setLocalBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
  }

  // Update block handler
  const handleUpdateBlock = (blockId: string, updatedBlock: UIBlock) => {
    const updatedBlocks = localBlocks.map(block => 
      block.id === blockId ? updatedBlock : block
    )
    
    setLocalBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
  }

  // Delete block handler
  const handleDeleteBlock = (blockId: string) => {
    const updatedBlocks = localBlocks.filter(block => block.id !== blockId)
    
    setLocalBlocks(updatedBlocks)
    onBlocksChange(updatedBlocks)
  }

  // Determine canvas width based on mode
  const getCanvasWidth = () => {
    switch (canvasMode) {
      case "mobile":
        return "w-full max-w-[375px]"
      case "tablet":
        return "w-full max-w-[768px]"
      case "desktop":
      default:
        return "w-full max-w-[1280px]"
    }
  }

  // Drop handler for the canvas itself
  const [, drop] = useDrop({
    accept: "COMPONENT",
    drop: (item: { id: string, type: string, defaultStyles: Record<string, string> }) => {
      // Handle component dropped from component panel
      const newBlock: UIBlock = {
        id: `block-${Date.now()}`,
        type: item.id,
        content: "",
        styles: item.defaultStyles || {},
      }
      
      const updatedBlocks = [...localBlocks, newBlock]
      setLocalBlocks(updatedBlocks)
      onBlocksChange(updatedBlocks)
    },
  })

  return (
    <div 
      ref={drop} 
      className="flex justify-center p-4 min-h-full"
      onClick={() => onBlockSelect("")} // Deselect when clicking canvas
    >
      <div className={cn(
        "min-h-[800px] bg-white dark:bg-gray-800 rounded shadow transition-all duration-300",
        getCanvasWidth()
      )}>
        {localBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded">
            <div className="text-center p-6">
              <p className="text-gray-500 dark:text-gray-400 mb-2">Drag components here to start building</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">or select a template from the panel</p>
            </div>
          </div>
        ) : (
          localBlocks.map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              index={index}
              moveBlock={moveBlock}
              onSelect={onBlockSelect}
              onDelete={handleDeleteBlock}
              onUpdate={handleUpdateBlock}
            />
          ))
        )}
      </div>
    </div>
  )
}

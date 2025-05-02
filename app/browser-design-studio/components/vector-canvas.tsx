"use client"

import React, { useRef, useEffect, useState } from "react"
import { useVectorStore } from "@/lib/services/browser-design-studio/stores/vector-store"
import { useTextStore } from "@/lib/services/browser-design-studio/stores/text-store"
import { Button } from "@/components/ui/button"
import { MousePointer, Pen, Square, Circle, PenTool } from "lucide-react"

interface Point {
  x: number
  y: number
}

interface PathData {
  id: string
  type: string
  points: Point[]
  strokeColor: string
  strokeWidth: number
  fill: string
  closed: boolean
  textId?: string
}

export default function VectorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [currentTool, setCurrentTool] = useState<string>("pen")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fillColor, setFillColor] = useState("transparent")
  const [isCreatingPathForText, setIsCreatingPathForText] = useState(false)
  const [pendingTextId, setPendingTextId] = useState<string | null>(null)
  const [attachTextToPath, setAttachTextToPath] = useState(true) // Default to attaching text
  
  // Create connection to vector store for state management
  const { 
    paths, 
    addPath, 
    updatePath, 
    clearPaths,
    selectedPathId,
    setSelectedPathId
  } = useVectorStore()

  // Connect to text store to access text nodes
  const { textNodes, selectedNodeId } = useTextStore()

  // Make component methods available externally
  useEffect(() => {
    // Add data attribute for component reference finding
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setAttribute('data-component-name', 'VectorCanvas');
    }

    // Handle tool changes from the design studio
    const handleToolChange = (event: CustomEvent) => {
      console.log("[VectorCanvas] Tool change event received:", event.detail);
      if (event.detail && event.detail.tool) {
        setCurrentTool(event.detail.tool);
      }
    };
    
    // Handle stroke color changes
    const handleStrokeColorChange = (event: CustomEvent) => {
      if (event.detail && event.detail.color) {
        setStrokeColor(event.detail.color);
      }
    };
    
    // Handle stroke width changes
    const handleStrokeWidthChange = (event: CustomEvent) => {
      if (event.detail && event.detail.width) {
        setStrokeWidth(event.detail.width);
      }
    };
    
    // Handle text-path activation
    const handleSwitchToVectorForText = (event: CustomEvent) => {
      console.log("[VectorCanvas] Received switch-to-vector-for-text event:", event.detail);
      // Set the flag to indicate we're creating a path for text
      setIsCreatingPathForText(true);
      
      // Store the pending text ID if provided
      if (event.detail && event.detail.textId) {
        console.log("[VectorCanvas] Setting pending text ID:", event.detail.textId);
        setPendingTextId(event.detail.textId);
        
        // Also store in DOM as backup access method
        document.body.setAttribute('data-pending-text-id', event.detail.textId);
      } else {
        console.error("[VectorCanvas] No textId provided in switch-to-vector-for-text event");
      }
      
      // Also set the current tool to path or the requested tool
      if (event.detail && event.detail.activateTool) {
        console.log("[VectorCanvas] Setting tool to:", event.detail.activateTool);
        setCurrentTool(event.detail.activateTool);
      }
    };
    
    // Handle text attachment toggle
    const handleTextAttachmentChange = (event: CustomEvent) => {
      console.log("[VectorCanvas] Received text attachment change:", event.detail);
      if (event.detail?.attachText !== undefined) {
        setAttachTextToPath(event.detail.attachText);
        console.log("[VectorCanvas] Text attachment set to:", event.detail.attachText);
      }
    }
    
    // Handle text selection change
    const handleTextChange = (event: CustomEvent) => {
      console.log("[VectorCanvas] Received text change event:", event.detail);
      if (event.detail?.textId) {
        setPendingTextId(event.detail.textId);
        console.log("[VectorCanvas] Pending text ID updated to:", event.detail.textId);
        
        // Ensure we're in text path creation mode
        setIsCreatingPathForText(true);
        
        // Find the text node to log information
        const textNode = textNodes.find(node => node.id === event.detail.textId);
        if (textNode) {
          console.log("[VectorCanvas] Selected text node:", textNode.text);
        } else {
          // Try direct store access as fallback
          const storeTextNodes = useTextStore.getState().textNodes;
          const storeTextNode = storeTextNodes.find(node => node.id === event.detail.textId);
          if (storeTextNode) {
            console.log("[VectorCanvas] Selected text node from store:", storeTextNode.text);
          } else {
            console.error("[VectorCanvas] Could not find text node with ID:", event.detail.textId);
          }
        }
      }
    }
    
    // Register event listeners
    window.addEventListener('vector-tool-change', handleToolChange as EventListener);
    window.addEventListener('vector-stroke-color-change', handleStrokeColorChange as EventListener);
    window.addEventListener('vector-stroke-width-change', handleStrokeWidthChange as EventListener);
    window.addEventListener('switch-to-vector-for-text', handleSwitchToVectorForText as EventListener);
    window.addEventListener('vector-text-attachment-change', handleTextAttachmentChange as EventListener);
    window.addEventListener('vector-text-change', handleTextChange as EventListener);
    
    return () => {
      window.removeEventListener('vector-tool-change', handleToolChange as EventListener);
      window.removeEventListener('vector-stroke-color-change', handleStrokeColorChange as EventListener);
      window.removeEventListener('vector-stroke-width-change', handleStrokeWidthChange as EventListener);
      window.removeEventListener('switch-to-vector-for-text', handleSwitchToVectorForText as EventListener);
      window.removeEventListener('vector-text-attachment-change', handleTextAttachmentChange as EventListener);
      window.removeEventListener('vector-text-change', handleTextChange as EventListener);
    };
  }, []);

  // Check for manual text path operations by looking for data attribute
  useEffect(() => {
    const checkPendingText = () => {
      const pendingId = document.body.getAttribute('data-pending-text-id');
      if (pendingId && pendingId !== pendingTextId) {
        console.log("[VectorCanvas] Found pending text ID in DOM:", pendingId);
        setPendingTextId(pendingId);
        setIsCreatingPathForText(true);
      }
    };
    
    // Check on mount and whenever we might get focus (tab visibility changes)
    checkPendingText();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingText();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pendingTextId]);

  // Effect to log text node info when pendingTextId changes
  useEffect(() => {
    if (pendingTextId) {
      console.log("[VectorCanvas] pendingTextId changed:", pendingTextId);
      // Get the text store state directly
      const storeTextNodes = useTextStore.getState().textNodes;
      console.log("[VectorCanvas] Direct store access, text nodes:", 
        storeTextNodes.map(n => ({ id: n.id, text: n.text })));
        
      const textNode = storeTextNodes.find(n => n.id === pendingTextId);
      if (textNode) {
        console.log("[VectorCanvas] Found text node:", textNode.text);
      } else {
        console.error("[VectorCanvas] Could not find text node with id:", pendingTextId);
      }
    }
  }, [pendingTextId]);

  // Render canvas function
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    
    if (!canvas || !ctx) return
    
    // Log the current drawing state
    if (isCreatingPathForText) {
      console.log("[VectorCanvas] In text-on-path mode:", { 
        pendingTextId, 
        selectedNodeId,
        pathLength: currentPath.length,
        isDrawing,
        textNodesCount: textNodes?.length || 0
      });
      
      // Debug the text node store
      if (pendingTextId) {
        const textNode = textNodes.find(n => n.id === pendingTextId);
        console.log("[VectorCanvas] Pending text node:", textNode ? 
          { id: textNode.id, text: textNode.text, style: textNode.style } : 
          "Not found");
      }
      
      console.log("[VectorCanvas] All text nodes:", textNodes.map(n => ({ id: n.id, text: n.text })));
    }
    
    // DPI adjustment
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    
    ctx.scale(dpr, dpr)
    
    // Reset canvas and redraw all paths
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw existing paths
    paths.forEach(path => drawPath(ctx, path))
    
    // Draw current path if we're in the middle of drawing
    if (isDrawing && currentPath.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      
      currentPath.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      
      ctx.stroke()
      
      // If we're creating a path for text, draw the text along the current path
      // But only draw preview text if attachment is enabled
      if (isCreatingPathForText && currentPath.length > 1 && attachTextToPath) {
        console.log("[VectorCanvas] Attempting to draw text on current path, length:", currentPath.length);
        console.log("[VectorCanvas] Text attachment is:", attachTextToPath ? "enabled" : "disabled");
        
        // Get text node ID either from state or DOM attribute as fallback
        const textId = pendingTextId || document.body.getAttribute('data-pending-text-id');
        
        // Try to get text node data in multiple ways to ensure we have it
        let textNode;
        
        if (textId) {
          // First try from our component state
          textNode = textNodes.find(node => node.id === textId);
          
          // If not found, try direct store access
          if (!textNode) {
            const storeTextNodes = useTextStore.getState().textNodes;
            textNode = storeTextNodes.find(node => node.id === textId);
            console.log("[VectorCanvas] Using direct store access for text node");
          }
        } else if (selectedNodeId) {
          // Try using selectedNodeId as fallback
          textNode = textNodes.find(node => node.id === selectedNodeId);
        }
        
        console.log("[VectorCanvas] Text node search results:", {
          textId,
          pendingTextId,
          selectedNodeId,
          textNodeFound: !!textNode,
          textNodesAvailable: textNodes.length
        });
          
        if (textNode) {
          console.log("[VectorCanvas] Drawing text node:", {
            id: textNode.id,
            text: textNode.text,
            style: {
              fontSize: textNode.style.fontSize,
              fontFamily: textNode.style.fontFamily,
              color: textNode.style.color
            }
          });
          
          // Ensure we're actually drawing the text
          drawTextAlongPath(ctx, textNode.text, currentPath, textNode.style);
        } else {
          console.error("[VectorCanvas] No text node found for path preview. textId:", textId, 
            "pendingTextId:", pendingTextId, "selectedNodeId:", selectedNodeId, 
            "textNodes count:", textNodes.length);
          
          // Debug: log all available text nodes
          console.log("[VectorCanvas] Available text nodes:", 
            textNodes && textNodes.length > 0 
              ? textNodes.map(n => ({ id: n.id, text: n.text }))
              : "No text nodes available");
          
          // Fallback - if we know there's supposed to be text, draw a placeholder
          if (textId) {
            console.log("[VectorCanvas] Using fallback placeholder text");
            const placeholderStyle = {
              fontSize: 24,
              fontFamily: 'Arial, sans-serif',
              color: '#000000'
            };
            drawTextAlongPath(ctx, "Text", currentPath, placeholderStyle);
          }
        }
      }
    }
  }, [paths, currentPath, isDrawing, strokeColor, strokeWidth, selectedPathId, isCreatingPathForText, pendingTextId, textNodes, selectedNodeId, attachTextToPath])

  // Draw a single path on the canvas
  const drawPath = (ctx: CanvasRenderingContext2D, path: PathData) => {
    ctx.beginPath()
    ctx.strokeStyle = path.strokeColor
    ctx.lineWidth = path.strokeWidth
    ctx.lineJoin = "round"
    ctx.lineCap = "round"

    path.points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    
    if (path.closed) {
      ctx.closePath()
      // Use a semi-transparent fill for better visibility
      if (path.type === "rect" || path.type === "circle") {
        ctx.fillStyle = path.fill !== "transparent" ? path.fill : "rgba(255, 255, 255, 0.1)"
        ctx.fill()
      }
    }
    
    ctx.stroke()
    
    // Check if this path has an associated text and draw it
    // Always show text for existing paths that have textId
    if (path.textId && path.points.length > 1) {
      // Find the text node using the textId
      const textNode = textNodes.find(node => node.id === path.textId);
      
      if (textNode) {
        console.log("[VectorCanvas] Drawing text on existing path:", textNode.text, "path:", path.id);
        drawTextAlongPath(ctx, textNode.text, path.points, textNode.style);
      }
    }
    
    // Draw selection indicator if this path is selected
    if (path.id === selectedPathId) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      
      // Create a bounding box for the path
      const points = path.points
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
      
      // Add padding
      const padding = 5
      ctx.strokeRect(
        minX - padding, 
        minY - padding, 
        maxX - minX + padding * 2, 
        maxY - minY + padding * 2
      )
      
      ctx.setLineDash([])
    }
  }

  // Function to draw text along a custom path
  const drawTextAlongPath = (
    ctx: CanvasRenderingContext2D,
    text: string,
    points: { x: number, y: number }[],
    textStyle: any
  ) => {
    if (!points || points.length < 2) {
      console.error("[VectorCanvas] Cannot draw text on path: invalid path points");
      return;
    }

    console.log("[VectorCanvas] Drawing text along current path:", text, "with", points.length, "points");
    
    // Save context
    ctx.save();
    
    try {
      // Calculate the total path length
      let pathLength = 0;
      let pathSegments: number[] = [];
      
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i-1];
        const p2 = points[i];
        const segmentLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        pathLength += segmentLength;
        pathSegments.push(segmentLength);
      }
      
      console.log("[VectorCanvas] Path length:", pathLength, "segments:", pathSegments.length);
      
      // Set text style
      const fontSize = textStyle?.fontSize || 24;
      const fontFamily = textStyle?.fontFamily || 'Arial, sans-serif';
      const fontWeight = textStyle?.fontWeight || 'normal';
      const fontStyle = textStyle?.fontStyle || 'normal';
      const color = textStyle?.color || '#000000';
      
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      console.log("[VectorCanvas] Using font:", ctx.font, "color:", ctx.fillStyle);
      
      // Calculate spacing per character
      const charCount = text.length;
      const spacingPerChar = pathLength / (charCount || 1); // Avoid division by zero
      
      console.log("[VectorCanvas] Text length:", charCount, "spacing per char:", spacingPerChar);
      
      // If path is too short for text, just draw it at the start
      if (pathLength < fontSize) {
        console.log("[VectorCanvas] Path too short, drawing text at start");
        ctx.fillText(text, points[0].x, points[0].y);
        ctx.restore();
        return;
      }
      
      // Draw each character
      let currentPos = 0;
      
      for (let i = 0; i < text.length; i++) {
        // Find the segment where this character should be placed
        let segmentIndex = 0;
        let segmentPos = 0;
        let currentLength = 0;
        
        // Determine which segment this character belongs to
        while (segmentIndex < pathSegments.length && currentLength + pathSegments[segmentIndex] < currentPos) {
          currentLength += pathSegments[segmentIndex];
          segmentIndex++;
        }
        
        if (segmentIndex >= pathSegments.length) {
          console.log("[VectorCanvas] Ran out of path at character:", i);
          break; // Ran out of path
        }
        
        segmentPos = currentPos - currentLength;
        
        // Calculate the position along this segment
        const p1 = points[segmentIndex];
        const p2 = points[segmentIndex + 1];
        const segmentLength = pathSegments[segmentIndex];
        const ratio = segmentPos / segmentLength;
        
        const x = p1.x + (p2.x - p1.x) * ratio;
        const y = p1.y + (p2.y - p1.y) * ratio;
        
        // Calculate angle (perpendicular to path direction)
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI/2;
        
        // Save position
        ctx.save();
        
        // Translate and rotate to position
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Draw character
        ctx.fillText(text[i], 0, 0);
        
        // Restore position
        ctx.restore();
        
        // Move to next position
        currentPos += spacingPerChar;
      }
      
      console.log("[VectorCanvas] Finished drawing text on path");
    } catch (error) {
      console.error("[VectorCanvas] Error drawing text on path:", error);
    }
    
    // Restore context
    ctx.restore();
  }

  // Handle mouse down event to start drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "select") return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setCurrentPath([{ x, y }])
  }

  // Special handling for shape tools
  const startPoint = useRef<Point | null>(null);
  const handleShapeTool = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log("Drawing from:", { x: startPoint.current.x, y: startPoint.current.y }, "to:", { x, y });

    if (currentTool === "rectangle") {
      // Rectangle drawing logic
      const minX = Math.min(startPoint.current.x, x);
      const maxX = Math.max(startPoint.current.x, x);
      const minY = Math.min(startPoint.current.y, y);
      const maxY = Math.max(startPoint.current.y, y);

      const points = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
        { x: minX, y: minY },
      ];
      setCurrentPath(points);
    } else if (currentTool === "circle") {
      // Circle drawing logic
      const radius = Math.sqrt(
        Math.pow(x - startPoint.current.x, 2) + Math.pow(y - startPoint.current.y, 2)
      );

      const points = [];
      const steps = 64;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        points.push({
          x: startPoint.current.x + Math.cos(angle) * radius,
          y: startPoint.current.y + Math.sin(angle) * radius,
        });
      }
      if (points.length > 0) {
        points.push({ ...points[0] });
      }
      setCurrentPath(points);
    }
  }

  // Handle mouse move event to continue drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    // For rectangle and circle tools, use the specialized handler
    if (currentTool === "rectangle" || currentTool === "circle") {
      handleShapeTool(e)
      return
    }
    
    // For other tools (pen, path, etc.)
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCurrentPath([...currentPath, { x, y }])
  }

  // Handle mouse up event to finish drawing
  const handleMouseUp = (switchToTextTab: boolean = false) => {
    if (!isDrawing || currentPath.length < 2) {
      setIsDrawing(false)
      startPoint.current = null;
      return
    }
    
    console.log(`[VectorCanvas] Finishing ${currentTool} drawing with ${currentPath.length} points`);
    
    // Determine the appropriate fill value
    let actualFill = fillColor;
    // For MS Paint-like behavior, use a light fill for shapes by default if none is set
    if ((currentTool === "rectangle" || currentTool === "circle") && fillColor === "transparent") {
      actualFill = "rgba(255, 255, 255, 0.1)";
    }
    
    // Create a new path object for the store
    const pathId = `path-${Date.now()}`
    
    // Log the current state for debugging
    console.log("[VectorCanvas] Creating new path with attachment status:", {
      isCreatingPathForText,
      attachTextToPath,
      pendingTextId: pendingTextId || document.body.getAttribute('data-pending-text-id') || 'none'
    });
    
    const newPath: PathData = {
      id: pathId,
      type: currentTool === "rectangle" ? "rect" : 
            currentTool === "circle" ? "circle" : "path",
      points: [...currentPath],
      strokeColor,
      strokeWidth,
      fill: actualFill,
      closed: currentTool === "rectangle" || currentTool === "circle",
      // Only attach text to new paths if the toggle is on
      textId: isCreatingPathForText && attachTextToPath ? 
             (pendingTextId || document.body.getAttribute('data-pending-text-id') || undefined) : 
             undefined
    }
    
    // Add to store
    addPath(newPath)
    console.log(`[VectorCanvas] Added new path with ID: ${pathId}, textId:`, newPath.textId);
    
    // Reset drawing state
    setIsDrawing(false)
    setCurrentPath([])
    startPoint.current = null;
    
    // If we were creating a path for text, notify the text panel
    if (isCreatingPathForText) {
      console.log("[VectorCanvas] Path created for text, dispatching event with pathId:", pathId);
      
      // Log whether text was attached
      console.log(`[VectorCanvas] Text attachment is ${attachTextToPath ? 'enabled' : 'disabled'}`);
      
      // Create a more reliable event with complete data
      const event = new CustomEvent('path-created-for-text', { 
        detail: { 
          pathId,
          pathType: currentTool === "rectangle" ? "rect" : 
                   currentTool === "circle" ? "circle" : "path",
          points: [...currentPath],
          strokeColor,
          strokeWidth,
          fill: actualFill,
          textId: pendingTextId,
          textAttached: attachTextToPath,
          switchToTextTab: switchToTextTab
        } 
      });
      
      // Dispatch the event
      window.dispatchEvent(event);
      
      // Reset the flags
      setIsCreatingPathForText(false);
      setPendingTextId(null);
      
      console.log("[VectorCanvas] Path-for-text creation completed, flags reset");
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar removed entirely to maximize drawing space */}
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-white dark:bg-gray-900"
        onMouseDown={(e) => {
          if (currentTool === "select") return;
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setIsDrawing(true);
          setCurrentPath([{ x, y }]);
          startPoint.current = { x, y };
        }}
        onMouseMove={(e) => {
          if (isDrawing) {
            handleMouseMove(e);
          }
        }}
        onMouseUp={(e) => handleMouseUp()}
        onMouseLeave={(e) => handleMouseUp()}
      />
    </div>
  )
}

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminalSquare, BookOpen, MousePointer2, Layers, Wand2, Download } from "lucide-react"

export default function ToolGuide() {
  return (
    <section id="guide" className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">How to Use the Photo Editor</h2>
        <p className="text-xl text-center max-w-3xl mx-auto text-muted-foreground mb-10">
          Follow this guide to get the most out of our powerful online photo editor.
        </p>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TerminalSquare className="mr-2 h-5 w-5" /> Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3">
                  <li className="leading-relaxed">
                    <strong>Upload an image</strong> - Start by uploading an image or creating a blank canvas by
                    clicking the "File" menu.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Select tools</strong> - Use the toolbar on the left to select different editing tools like
                    Move, Selection, Magic Wand, Brush, and Text.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Adjust properties</strong> - The right sidebar provides controls for the selected tool and
                    layer adjustments.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Zoom and pan</strong> - Use the zoom controls at the top or Ctrl + Mousewheel to zoom, and
                    the Hand tool to pan around.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Save your work</strong> - Export your image in various formats using the Export panel in the
                    sidebar.
                  </li>
                </ol>
                <p className="text-sm text-muted-foreground mt-4">
                  Pro tip: Press "?" to see all keyboard shortcuts for faster editing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="mr-2 h-5 w-5" /> Working with Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Layers are fundamental to advanced photo editing, allowing you to work on different elements
                  separately.
                </p>
                <ul className="list-disc list-inside space-y-3">
                  <li className="leading-relaxed">
                    <strong>Add layers</strong> - Click the "+" button in the layers panel or toolbar.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Reorder layers</strong> - Drag and drop layers in the panel to change their stacking order.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Visibility</strong> - Toggle the eye icon to show/hide specific layers.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Lock layers</strong> - Click the lock icon to prevent changes to a layer.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Blend modes</strong> - Change how layers interact with each other using blend modes like
                    Multiply, Screen, or Overlay.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Opacity</strong> - Adjust layer transparency with the opacity slider.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MousePointer2 className="mr-2 h-5 w-5" /> Using the Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Selection Tools</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Rectangular Selection (M)</strong> - Select rectangular areas
                      </li>
                      <li>
                        <strong>Magic Wand (W)</strong> - Select areas by color similarity
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Drawing Tools</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Brush (B)</strong> - Paint with customizable brushes
                      </li>
                      <li>
                        <strong>Eraser (E)</strong> - Remove parts of a layer
                      </li>
                      <li>
                        <strong>Shape Tool</strong> - Add geometric shapes
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Text & Typography</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Text Tool (T)</strong> - Add editable text
                      </li>
                      <li>Control font, size, color, and alignment</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Utility Tools</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Move Tool (V)</strong> - Reposition elements
                      </li>
                      <li>
                        <strong>Crop Tool (C)</strong> - Trim the canvas
                      </li>
                      <li>
                        <strong>Eyedropper (I)</strong> - Pick colors from the image
                      </li>
                      <li>
                        <strong>Hand Tool (H)</strong> - Pan around the canvas
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="mr-2 h-5 w-5" /> Adjustments & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Enhance your images with powerful adjustment tools and filters.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Basic Adjustments</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Brightness & Contrast</li>
                      <li>Saturation & Hue</li>
                      <li>Temperature & Tint</li>
                      <li>Sharpness & Blur</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Filters</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Vintage</li>
                      <li>Black & White</li>
                      <li>Warm & Cool</li>
                      <li>Dramatic</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">How to Apply Effects</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Select the layer you want to modify</li>
                    <li>Open the Adjustments or Filters panel in the sidebar</li>
                    <li>Use the sliders to adjust properties or select a preset filter</li>
                    <li>See the changes applied in real-time</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5" /> Saving & Exporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Once you've finished editing, you can export your work in several ways:</p>

                <ol className="list-decimal list-inside space-y-3">
                  <li className="leading-relaxed">
                    <strong>Quick Export</strong> - Click "Export" in the main menu for quick PNG export.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Advanced Export</strong> - Use the Export panel in the sidebar for more options.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Format Selection</strong> - Choose between PNG (with transparency), JPEG (smaller file
                    size), WebP (modern format), or SVG (vector format for text and shapes).
                  </li>
                  <li className="leading-relaxed">
                    <strong>Quality Settings</strong> - Adjust quality vs. file size for JPEG and WebP formats.
                  </li>
                  <li className="leading-relaxed">
                    <strong>Resize on Export</strong> - Specify dimensions to resize during export.
                  </li>
                </ol>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md mt-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" /> Export Format Guide
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      <strong>PNG</strong> - Best for images with transparency and graphics
                    </li>
                    <li>
                      <strong>JPEG</strong> - Ideal for photographs and when file size matters
                    </li>
                    <li>
                      <strong>WebP</strong> - Modern format with good compression and quality
                    </li>
                    <li>
                      <strong>SVG</strong> - Vector format for text and shapes that scales infinitely
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

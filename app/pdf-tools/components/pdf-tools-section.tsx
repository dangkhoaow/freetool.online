"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Scissors, FileUp, FileDown, Combine, Minimize, RotateCw } from "lucide-react"
import MergePdfTool from "./tools/merge-pdf-tool"
import SplitPdfTool from "./tools/split-pdf-tool"
import CompressPdfTool from "./tools/compress-pdf-tool"
import PdfToImageTool from "./tools/pdf-to-image-tool"
import ImageToPdfTool from "./tools/image-to-pdf-tool"
import RotatePdfTool from "./tools/rotate-pdf-tool"

export default function PdfToolsSection() {
  const [activeTab, setActiveTab] = useState("merge-pdf")

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">PDF Tools</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Select a tool below to get started. All tools work directly in your browser - no software installation
          required.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-24 md:mb-8">
          <TabsTrigger value="merge-pdf" className="flex flex-col items-center gap-2 py-3 px-2">
            <Combine className="h-5 w-5" />
            <span className="text-xs">Merge PDF</span>
          </TabsTrigger>
          <TabsTrigger value="split-pdf" className="flex flex-col items-center gap-2 py-3 px-2">
            <Scissors className="h-5 w-5" />
            <span className="text-xs">Split PDF</span>
          </TabsTrigger>
          <TabsTrigger value="compress-pdf" className="flex flex-col items-center gap-2 py-3 px-2">
            <Minimize className="h-5 w-5" />
            <span className="text-xs">Compress PDF</span>
          </TabsTrigger>
          <TabsTrigger value="rotate-pdf" className="flex flex-col items-center gap-2 py-3 px-2">
            <RotateCw className="h-5 w-5" />
            <span className="text-xs">Rotate PDF</span>
          </TabsTrigger>
          <TabsTrigger value="pdf-to-image" className="flex flex-col items-center gap-2 py-3 px-2">
            <FileDown className="h-5 w-5" />
            <span className="text-xs">PDF to Image</span>
          </TabsTrigger>
          <TabsTrigger value="image-to-pdf" className="flex flex-col items-center gap-2 py-3 px-2">
            <FileUp className="h-5 w-5" />
            <span className="text-xs">Image to PDF</span>
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8 md:mt-4 pt-4 md:pt-0">
          <TabsContent value="merge-pdf">
            <MergePdfTool />
          </TabsContent>

          <TabsContent value="split-pdf">
            <SplitPdfTool />
          </TabsContent>

          <TabsContent value="compress-pdf">
            <CompressPdfTool />
          </TabsContent>
          
          <TabsContent value="rotate-pdf">
            <RotatePdfTool />
          </TabsContent>

          <TabsContent value="pdf-to-image">
            <PdfToImageTool />
          </TabsContent>

          <TabsContent value="image-to-pdf">
            <ImageToPdfTool />
          </TabsContent>
        </div>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              100% Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              All our PDF tools are completely free to use with no hidden fees, watermarks, or limitations.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Private & Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Your files never leave your device. All processing happens directly in your browser for complete privacy.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              No Installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              No need to download or install any software. Our tools work directly in your web browser.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

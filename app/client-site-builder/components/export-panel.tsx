"use client"

import { useState } from "react"
import { 
  Download, 
  Code, 
  FileJson, 
  FileUp, 
  Globe, 
  FileArchive, 
  UploadCloud,
  Check,
  Box
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project } from "./site-builder-tool"
import { useToast } from "@/components/ui/use-toast"

interface ExportPanelProps {
  project: Project | null
  onExport: (format: string) => void
}

export default function ExportPanel({ project, onExport }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState("html")
  const [exportOptions, setExportOptions] = useState({
    includeAssets: true,
    minify: true,
    optimizeImages: true
  })
  const [loading, setLoading] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const { toast } = useToast()

  const handleExport = () => {
    if (!project) return
    
    setLoading(true)
    
    // Simulate export process
    setTimeout(() => {
      setLoading(false)
      setExportComplete(true)
      
      toast({
        title: "Export successful",
        description: "Your website has been exported successfully.",
        duration: 3000
      })
      
      // Reset the complete state after a delay
      setTimeout(() => {
        setExportComplete(false)
      }, 3000)
      
      onExport(exportFormat)
    }, 2000)
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Download className="h-10 w-10 text-gray-400 mb-2" />
        <h3 className="text-lg font-medium mb-2 dark:text-white">No Project Open</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Open or create a project first to export your website.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4">
        <div className="flex items-start">
          <Download className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium mb-1 dark:text-white">Export Your Website</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Generate clean, optimized code that can be hosted anywhere. All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="file" className="flex-1">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="file" className="text-xs">
            <FileArchive className="h-4 w-4 mr-1" />
            File Export
          </TabsTrigger>
          <TabsTrigger value="code" className="text-xs">
            <Code className="h-4 w-4 mr-1" />
            Code
          </TabsTrigger>
          <TabsTrigger value="deploy" className="text-xs">
            <Globe className="h-4 w-4 mr-1" />
            Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 dark:text-white">Export Format</h3>
            <RadioGroup 
              defaultValue="html" 
              value={exportFormat} 
              onValueChange={setExportFormat}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html" className="flex items-center">
                  <FileArchive className="h-4 w-4 mr-2" />
                  <span>Static HTML/CSS/JS (ZIP)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center">
                  <FileJson className="h-4 w-4 mr-2" />
                  <span>Project Data (JSON)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 dark:text-white">Export Options</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-assets"
                  checked={exportOptions.includeAssets}
                  onChange={(e) => setExportOptions({...exportOptions, includeAssets: e.target.checked})}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="include-assets">Include assets (images, fonts)</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="minify"
                  checked={exportOptions.minify}
                  onChange={(e) => setExportOptions({...exportOptions, minify: e.target.checked})}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="minify">Minify HTML/CSS/JS</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="optimize-images"
                  checked={exportOptions.optimizeImages}
                  onChange={(e) => setExportOptions({...exportOptions, optimizeImages: e.target.checked})}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="optimize-images">Optimize images</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            className="w-full mt-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-300 border-t-white rounded-full" />
                Exporting...
              </>
            ) : exportComplete ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Exported!
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Website
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="code" className="flex flex-col space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <h3 className="text-sm font-medium mb-2 dark:text-white">Generated Code</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Preview and copy the generated code for your website.
            </p>
            
            <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs font-mono overflow-auto max-h-[300px]">
              <pre>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Generated HTML structure will appear here -->
  <header>
    <div class="container">
      <h1>Your Website</h1>
      <!-- Navigation -->
    </div>
  </header>
  
  <main>
    ${project.pages.map(page => `<!-- Page: ${page.name} -->`).join('\n    ')}
    <!-- Components will be rendered here -->
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${project.name}</p>
    </div>
  </footer>
  
  <script src="main.js"></script>
</body>
</html>`}</pre>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Code className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        </TabsContent>

        <TabsContent value="deploy" className="flex flex-col space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
            <h3 className="text-sm font-medium mb-2 dark:text-white">Deploy Options</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Deploy your website directly to a hosting platform.
            </p>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Box className="h-4 w-4 mr-2" />
                Netlify
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Box className="h-4 w-4 mr-2" />
                Vercel
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Box className="h-4 w-4 mr-2" />
                GitHub Pages
              </Button>
            </div>
          </div>
          
          <div className="mt-auto">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Note: Deploying will generate and upload your static site files to the selected platform.
              You'll need to authenticate with the platform during the deployment process.
            </p>
            
            <Button className="w-full">
              <UploadCloud className="h-4 w-4 mr-2" />
              Deploy Website
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

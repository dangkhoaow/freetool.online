import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUp, Settings, FileArchive, Download } from "lucide-react"

export default function ToolGuide() {
  return (
    <section className="py-16 px-4 bg-gray-50" id="guide">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How to Use Our Zip Compressor</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow these simple steps to compress your files and folders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Upload Files
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop your files or folders into the upload area, or use the file browser to select them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Configure Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Choose your compression level, format, and whether to add password protection or split the archive.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileArchive className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Compress Files
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Click the "Start Compression" button and wait while our tool processes your files.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Download Result
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Once compression is complete, download your compressed archive or share it directly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

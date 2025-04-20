import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileArchive, Lock, Zap, Layers, FileDown, Gauge } from "lucide-react"

export default function FeatureSection() {
  return (
    <section className="py-16 px-4 bg-white" id="features">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Compression Features</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our free online zip compressor offers a range of features to help you manage and secure your files
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <Gauge className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Adjustable Compression</CardTitle>
              <CardDescription>Choose your compression level from fast to maximum compression</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Balance between speed and file size with our adjustable compression settings. Optimize for your specific
                needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Lock className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Password Protection</CardTitle>
              <CardDescription>Secure your compressed files with password encryption</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your archives with strong password protection. Keep your sensitive files
                safe from unauthorized access.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Fast Processing</CardTitle>
              <CardDescription>Compress files quickly with our optimized algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our advanced compression engine processes your files rapidly, saving you time while still delivering
                excellent compression ratios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <Layers className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Multiple Formats</CardTitle>
              <CardDescription>Support for ZIP, 7Z, and TAR archive formats</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose from different archive formats to suit your specific needs. Each format offers different advantages
                in terms of compatibility and compression.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <FileDown className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Batch Compression</CardTitle>
              <CardDescription>Compress multiple files and folders at once</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Save time by compressing multiple files and entire folders in a single operation. Perfect for organizing
                large collections of files.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <FileArchive className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Split Archives</CardTitle>
              <CardDescription>Split large archives into smaller parts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Break down large archives into manageable chunks for easier sharing and storage. Perfect for when you need
                to work with file size limitations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

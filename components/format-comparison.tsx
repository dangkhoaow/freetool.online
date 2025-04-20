import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X } from "lucide-react"

export default function FormatComparison() {
  const formats = [
    {
      name: "JPG",
      description: "The most widely supported image format",
      compatibility: "Excellent",
      quality: "Good",
      fileSize: "Medium",
      transparency: false,
      bestFor: "Photos, general use",
    },
    {
      name: "PNG",
      description: "Lossless compression with transparency support",
      compatibility: "Very Good",
      quality: "Excellent",
      fileSize: "Large",
      transparency: true,
      bestFor: "Graphics, screenshots, images with transparency",
    },
    {
      name: "WEBP",
      description: "Modern format with excellent compression",
      compatibility: "Good",
      quality: "Very Good",
      fileSize: "Small",
      transparency: true,
      bestFor: "Web images, optimized websites",
    },
    {
      name: "PDF",
      description: "Document format that preserves image quality",
      compatibility: "Excellent",
      quality: "Excellent",
      fileSize: "Large",
      transparency: true,
      bestFor: "Documents, printing, archiving",
    },
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Format Comparison</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the right format for your needs. Each format has its own advantages and ideal use cases.
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Format</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Compatibility</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Transparency</TableHead>
                <TableHead>Best For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formats.map((format) => (
                <TableRow key={format.name}>
                  <TableCell className="font-medium">{format.name}</TableCell>
                  <TableCell>{format.description}</TableCell>
                  <TableCell>{format.compatibility}</TableCell>
                  <TableCell>{format.quality}</TableCell>
                  <TableCell>{format.fileSize}</TableCell>
                  <TableCell>
                    {format.transparency ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>{format.bestFor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}

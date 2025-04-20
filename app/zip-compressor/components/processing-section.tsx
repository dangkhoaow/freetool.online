"use client"

import { Progress } from "@/components/ui/progress"
import { Loader2, Shield } from "lucide-react"
import type { CompressionJob } from "./compressor-tool"

interface ProcessingSectionProps {
  job: CompressionJob | null
}

export default function ProcessingSection({ job }: ProcessingSectionProps) {
  if (!job) {
    return <div className="text-center p-8">No active compression job</div>
  }

  const getStageText = () => {
    if (job.progress < 50) {
      return "Reading files..."
    } else if (job.progress < 80) {
      return "Compressing data..."
    } else {
      return "Finalizing archive..."
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">
          {job.status === "pending" && "Preparing Files"}
          {job.status === "processing" && "Compressing Files Locally"}
          {job.status === "completed" && "Compression Complete"}
          {job.status === "failed" && "Compression Failed"}
        </h3>

        <p className="text-muted-foreground mb-4">
          {job.status === "pending" && "Getting everything ready..."}
          {job.status === "processing" && job.progress ? getStageText() : "Processing files in your browser..."}
          {job.status === "completed" && "Your files have been successfully compressed!"}
          {job.status === "failed" && (job.error || "An error occurred during compression")}
        </p>
      </div>

      {(job.status === "pending" || job.status === "processing") && (
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Compression Details</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span>Files:</span>
                <span>{job.files.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Format:</span>
                <span>{job.settings.format.toUpperCase()}</span>
              </li>
              <li className="flex justify-between">
                <span>Compression Level:</span>
                <span>{job.settings.compressionLevel}/9</span>
              </li>
              <li className="flex justify-between">
                <span>Password Protected:</span>
                <span>{job.settings.password ? "Yes" : "No"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-800 flex items-start gap-3">
            <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Secure Browser-Based Compression</p>
              <p className="mt-1">Your files are being compressed directly in your browser. Nothing is uploaded to our servers, ensuring complete privacy and security of your data.</p>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Please don't close this window while compression is in progress
          </p>
        </div>
      )}
    </div>
  )
}

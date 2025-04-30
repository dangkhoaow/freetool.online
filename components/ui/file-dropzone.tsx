"use client"

import { useState, useCallback } from "react"
import { useDropzone, Accept } from "react-dropzone"
import { Upload, FileIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void
  accept?: Accept
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function FileDropzone({
  onDrop,
  accept,
  maxFiles = 1,
  maxSize = 10485760, // 10MB default
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        
        if (rejection.errors[0].code === "file-too-large") {
          setError(`File is too large. Max size is ${maxSize / 1048576}MB.`)
        } else if (rejection.errors[0].code === "file-invalid-type") {
          setError("Invalid file type.")
        } else {
          setError(rejection.errors[0].message)
        }
        
        return
      }

      setError(null)
      
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles)
      }
    },
    [maxSize, onDrop]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 transition-colors",
        isDragging || isDragActive
          ? "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50"
          : "hover:border-gray-400 dark:hover:border-gray-600",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isDragging
              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          )}
        >
          <Upload size={24} className={isDragging ? "animate-bounce" : ""} />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span className="font-medium">Drop your file here</span> or{" "}
            <button
              type="button"
              onClick={open}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none disabled:opacity-50"
              disabled={disabled}
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {accept
              ? `Supported formats: ${
                  typeof accept === "string"
                    ? (accept as string).replace(/\./g, "").toUpperCase()
                    : Object.keys(accept)
                        .map((key) => key.replace(/^.*\//, "").toUpperCase())
                        .join(", ")
                }`
              : "All file types accepted"}
          </p>
          {maxSize && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Max size: {(maxSize / 1048576).toFixed(0)}MB
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

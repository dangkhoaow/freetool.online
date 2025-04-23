"use client"

import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CompressionSettings } from "./compressor-tool"
import { formatBytes } from "@/lib/utils"
import { Lock, FileArchive, Settings2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SettingsPanelProps {
  settings: CompressionSettings
  onSettingsChange: (settings: Partial<CompressionSettings>) => void
  onStartCompression: () => void
  files: File[]
}

export default function SettingsPanel({ settings, onSettingsChange, onStartCompression, files }: SettingsPanelProps) {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)
  // Improved estimate based on compression level
  const compressionFactor = settings.compressionLevel === 0 
    ? 1 
    : Math.max(0.3, 1 - (settings.compressionLevel * 0.07))
  const estimatedCompressedSize = Math.floor(totalSize * compressionFactor)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Settings2 size={20} />
          Compression Settings
        </h3>
        <div className="text-sm text-muted-foreground">
          {files.length} files ({formatBytes(totalSize)})
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-2 py-1">
          Browser-Based Compression
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info size={16} className="text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-80 text-sm">
                Your files are compressed entirely in your browser. Nothing is uploaded to our servers,
                ensuring your data remains private and secure.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="compression-level">Compression Level</Label>
            <span className="text-sm text-muted-foreground">
              {settings.compressionLevel === 0 && "No Compression"}
              {settings.compressionLevel > 0 && settings.compressionLevel < 4 && "Fast (Low Compression)"}
              {settings.compressionLevel >= 4 && settings.compressionLevel < 7 && "Balanced"}
              {settings.compressionLevel >= 7 && settings.compressionLevel < 9 && "High Compression"}
              {settings.compressionLevel >= 9 && "Maximum Compression"}
            </span>
          </div>
          <Slider
            id="compression-level"
            min={0}
            max={9}
            step={1}
            value={[settings.compressionLevel]}
            onValueChange={([value]) => onSettingsChange({ compressionLevel: value })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Faster</span>
            <span>Smaller Size</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Archive Format</Label>
          <Select
            value={settings.format}
            onValueChange={(value: "zip" | "7z" | "tar") => onSettingsChange({ format: value })}
          >
            <SelectTrigger id="format" className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zip">ZIP (Most Compatible)</SelectItem>
              <SelectItem value="7z" disabled>7Z (Not supported in browser)</SelectItem>
              <SelectItem value="tar" disabled>TAR (Not supported in browser)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Browser-based compression currently only supports ZIP format
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock size={16} />
            Password Protection
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Leave empty for no password"
            value={settings.password}
            onChange={(e) => onSettingsChange({ password: e.target.value })}
            disabled={true}
          />
          <p className="text-xs text-muted-foreground">
            Password protection is coming soon to the browser-based compression
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="split-size">Split Archive (Optional)</Label>
          <Select
            value={settings.splitSize?.toString() || ""}
            onValueChange={(value) =>
              onSettingsChange({
                splitSize: value ? Number.parseInt(value) : null,
              })
            }
            disabled={true}
          >
            <SelectTrigger id="split-size" className="w-full">
              <SelectValue placeholder="Don't split archive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Don't split archive</SelectItem>
              <SelectItem value="10485760">10 MB parts</SelectItem>
              <SelectItem value="104857600">100 MB parts</SelectItem>
              <SelectItem value="524288000">500 MB parts</SelectItem>
              <SelectItem value="1073741824">1 GB parts</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Archive splitting is coming soon to the browser-based compression
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="include-subfolders"
            checked={settings.includeSubfolders}
            onCheckedChange={(checked) => onSettingsChange({ includeSubfolders: checked })}
          />
          <Label htmlFor="include-subfolders">Maintain folder structure</Label>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-medium mb-2">Compression Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Original Size:</div>
          <div className="text-right">{formatBytes(totalSize)}</div>

          <div>Estimated Compressed Size:</div>
          <div className="text-right">{formatBytes(estimatedCompressedSize)}</div>

          <div>Estimated Savings:</div>
          <div className="text-right text-green-600 dark:text-green-400">
            {formatBytes(totalSize - estimatedCompressedSize)} (
            {Math.round(((totalSize - estimatedCompressedSize) / totalSize) * 100)}%)
          </div>
        </div>
      </div>

      <Button onClick={onStartCompression} className="w-full gap-2">
        <FileArchive size={18} />
        Start Compression
      </Button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, RefreshCw, Trash } from "lucide-react"
import { getMd5ConverterService } from "@/lib/services/md5-converter-service"

interface ConversionResult {
  input: string
  output: string
  timestamp: number
}

export default function TextToMD5Section() {
  const [inputText, setInputText] = useState<string>("")
  const [md5Hash, setMd5Hash] = useState<string>("")
  const [isConverting, setIsConverting] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [history, setHistory] = useState<ConversionResult[]>([])
  const [batchMode, setBatchMode] = useState<boolean>(false)
  const [batchResults, setBatchResults] = useState<ConversionResult[]>([])

  const md5Service = getMd5ConverterService()

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("md5_conversion_history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse history:", e)
      }
    }
  }, [])

  const saveToHistory = (input: string, output: string) => {
    const newResult: ConversionResult = {
      input,
      output,
      timestamp: Date.now(),
    }

    const updatedHistory = [newResult, ...history].slice(0, 10) // Keep only the last 10 items
    setHistory(updatedHistory)

    // Save to localStorage
    localStorage.setItem("md5_conversion_history", JSON.stringify(updatedHistory))
  }

  const handleConvert = async () => {
    if (!inputText.trim()) return

    setIsConverting(true)

    try {
      if (batchMode) {
        // Split by new lines and convert each line
        const lines = inputText.split("\n").filter((line) => line.trim())
        const results = await Promise.all(
          lines.map(async (line) => {
            const hash = await md5Service.textToMD5(line.trim())
            return {
              input: line.trim(),
              output: hash,
              timestamp: Date.now(),
            }
          }),
        )

        setBatchResults(results)

        // Save only the first result to history to avoid cluttering
        if (results.length > 0) {
          saveToHistory(results[0].input, results[0].output)
        }
      } else {
        const hash = await md5Service.textToMD5(inputText.trim())
        setMd5Hash(hash)
        saveToHistory(inputText.trim(), hash)
      }
    } catch (error) {
      console.error("Conversion error:", error)
    } finally {
      setIsConverting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("md5_conversion_history")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="input-text">Enter Text to Convert</Label>
        <Textarea
          id="input-text"
          placeholder="Type or paste text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="batch-mode"
          checked={batchMode}
          onChange={() => setBatchMode(!batchMode)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="batch-mode" className="text-sm font-normal">
          Batch Mode (convert each line separately)
        </Label>
      </div>

      <Button onClick={handleConvert} disabled={isConverting || !inputText.trim()} className="w-full">
        {isConverting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          "Convert to MD5"
        )}
      </Button>

      {!batchMode && md5Hash && (
        <div className="space-y-2 mt-6">
          <Label htmlFor="md5-output">MD5 Hash Result</Label>
          <div className="flex">
            <Input id="md5-output" value={md5Hash} readOnly className="font-mono" />
            <Button variant="outline" size="icon" className="ml-2" onClick={() => copyToClipboard(md5Hash)}>
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {batchMode && batchResults.length > 0 && (
        <div className="space-y-2 mt-6">
          <Label>Batch Results</Label>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Input
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MD5 Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {batchResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]">
                      {result.input}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{result.output}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.output)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2 mt-6">
          <div className="flex justify-between items-center">
            <Label>Recent Conversions</Label>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Input
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MD5 Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]">
                      {item.input}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{item.output}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.output)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

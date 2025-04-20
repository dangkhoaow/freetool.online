"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, RefreshCw, Copy, Check } from "lucide-react"
import { getMd5ConverterService } from "@/lib/services/md5-converter-service"

export default function MD5ToTextSection() {
  const [md5Hash, setMd5Hash] = useState<string>("")
  const [result, setResult] = useState<{ found: boolean; text?: string }>({ found: false })
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const md5Service = getMd5ConverterService()

  const handleLookup = async () => {
    if (!md5Hash.trim() || !/^[a-fA-F0-9]{32}$/.test(md5Hash)) {
      setResult({ found: false })
      return
    }

    setIsSearching(true)

    try {
      const text = await md5Service.md5ToText(md5Hash.trim())
      setResult({ found: !!text, text })
    } catch (error) {
      console.error("Lookup error:", error)
      setResult({ found: false })
    } finally {
      setIsSearching(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Alert variant="warning" className="mb-4">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important Information</AlertTitle>
        <AlertDescription>
          MD5 is a one-way hash function. It's not designed to be reversed. This tool attempts to look up the hash in a
          database of known values, but success is not guaranteed. For security purposes, we only have a limited
          database of common words and phrases.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="md5-input">Enter MD5 Hash</Label>
        <Input
          id="md5-input"
          placeholder="Enter 32-character MD5 hash..."
          value={md5Hash}
          onChange={(e) => setMd5Hash(e.target.value)}
          className="font-mono"
        />
        {md5Hash && !/^[a-fA-F0-9]{32}$/.test(md5Hash) && (
          <p className="text-sm text-red-500 mt-1">
            Please enter a valid 32-character MD5 hash (hexadecimal characters only)
          </p>
        )}
      </div>

      <Button
        onClick={handleLookup}
        disabled={isSearching || !md5Hash.trim() || !/^[a-fA-F0-9]{32}$/.test(md5Hash)}
        className="w-full"
      >
        {isSearching ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          "Look Up Original Text"
        )}
      </Button>

      {!isSearching && md5Hash && (
        <div className="mt-6">
          {result.found ? (
            <div className="space-y-2">
              <Label htmlFor="text-output">Original Text</Label>
              <div className="flex">
                <Input id="text-output" value={result.text} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={() => copyToClipboard(result.text || "")}
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Not Found</AlertTitle>
              <AlertDescription>
                The original text for this MD5 hash could not be found in our database. Remember that MD5 is a one-way
                function, and we can only find matches for common words and phrases.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

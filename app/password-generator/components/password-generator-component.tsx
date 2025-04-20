"use client"

import { useState, useEffect } from "react"
import { Clipboard, Check, RefreshCw, Save, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import the service functions
import {
  generatePassword,
  validateOptions,
  calculatePasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  savePassword,
  getSavedPasswords,
  deleteSavedPassword,
  updatePasswordLabel,
  type PasswordOptions,
  type SavedPassword,
} from "@/lib/services/password-generator-service"

// Using default export instead of named export
export default function PasswordGenerator() {
  // Password options state
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
  })

  // Generated password state
  const [password, setPassword] = useState("")
  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState("")
  const [strengthColor, setStrengthColor] = useState("")

  // Copy button state
  const [copied, setCopied] = useState(false)

  // Saved passwords state
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")

  // Error state
  const [error, setError] = useState("")

  // Generate initial password on component mount
  useEffect(() => {
    handleGeneratePassword()
    loadSavedPasswords()
  }, [])

  // Update strength indicators when password changes
  useEffect(() => {
    if (password) {
      const score = calculatePasswordStrength(password)
      setStrength(score)
      setStrengthLabel(getStrengthLabel(score))
      setStrengthColor(getStrengthColor(score))
    }
  }, [password])

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  // Handle password option changes
  const handleOptionChange = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  // Generate a new password
  const handleGeneratePassword = () => {
    try {
      setError("")
      if (!validateOptions(options)) {
        setError("Please select at least one character type and a length between 8-128")
        return
      }

      const newPassword = generatePassword(options)
      setPassword(newPassword)
    } catch (err) {
      console.error("Error generating password:", err)
      setError("Failed to generate password. Please try again.")
    }
  }

  // Copy password to clipboard
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      setError("Failed to copy to clipboard. Please try again.")
    }
  }

  // Save password to localStorage
  const handleSavePassword = () => {
    try {
      const savedPassword = savePassword(password)
      setSavedPasswords((prev) => [savedPassword, ...prev])
    } catch (err) {
      console.error("Error saving password:", err)
      setError("Failed to save password. Please try again.")
    }
  }

  // Load saved passwords from localStorage
  const loadSavedPasswords = () => {
    try {
      const passwords = getSavedPasswords()
      setSavedPasswords(passwords)
    } catch (err) {
      console.error("Error loading saved passwords:", err)
      setError("Failed to load saved passwords.")
    }
  }

  // Delete a saved password
  const handleDeletePassword = (id: string) => {
    try {
      deleteSavedPassword(id)
      setSavedPasswords((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Error deleting password:", err)
      setError("Failed to delete password. Please try again.")
    }
  }

  // Start editing a password label
  const handleStartEdit = (id: string, currentLabel?: string) => {
    setEditingId(id)
    setEditLabel(currentLabel || "")
  }

  // Save edited password label
  const handleSaveEdit = (id: string) => {
    try {
      updatePasswordLabel(id, editLabel)
      setSavedPasswords((prev) => prev.map((p) => (p.id === id ? { ...p, label: editLabel } : p)))
      setEditingId(null)
    } catch (err) {
      console.error("Error updating password label:", err)
      setError("Failed to update password label. Please try again.")
    }
  }

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="generator">Password Generator</TabsTrigger>
          <TabsTrigger value="saved">Saved Passwords</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Generate a Secure Password</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password-output">Your Password</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGeneratePassword}
                      title="Generate new password"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      <span className="sr-only md:not-sr-only md:inline">Regenerate</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopyPassword}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Clipboard className="h-4 w-4 mr-1" />
                      )}
                      <span className="sr-only md:not-sr-only md:inline">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSavePassword}
                      title="Save password"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="sr-only md:not-sr-only md:inline">Save</span>
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    id="password-output"
                    value={password}
                    readOnly
                    className="font-mono text-base pr-20"
                  />
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Strength:</span>
                    <span>{strengthLabel}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthColor} transition-all duration-300`}
                      style={{ width: `${strength}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="password-length">Password Length: {options.length}</Label>
                  </div>
                  <Slider
                    id="password-length"
                    min={8}
                    max={128}
                    step={1}
                    value={[options.length]}
                    onValueChange={(value) => handleOptionChange('length', value[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>8</span>
                    <span>32</span>
                    <span>64</span>
                    <span>96</span>
                    <span>128</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-lowercase" className="cursor-pointer">
                      Include Lowercase Letters (a-z)
                    </Label>
                    <Switch
                      id="include-lowercase"
                      checked={options.includeLowercase}
                      onCheckedChange={(checked) => 
                        handleOptionChange('includeLowercase', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-uppercase" className="cursor-pointer">
                      Include Uppercase Letters (A-Z)
                    </Label>
                    <Switch
                      id="include-uppercase"
                      checked={options.includeUppercase}
                      onCheckedChange={(checked) => 
                        handleOptionChange('includeUppercase', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-numbers" className="cursor-pointer">
                      Include Numbers (0-9)
                    </Label>
                    <Switch
                      id="include-numbers"
                      checked={options.includeNumbers}
                      onCheckedChange={(checked) => 
                        handleOptionChange('includeNumbers', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-symbols" className="cursor-pointer">
                      Include Symbols (!@#$%^&*()_+~`|}{[]:;?><,./-=)
                    </Label>
                    <Switch
                      id="include-symbols"
                      checked={options.includeSymbols}
                      onCheckedChange={(checked) => 
                        handleOptionChange('includeSymbols', checked)
                      }dChange={(checked) => 
                        handleOptionChange('includeSymbols', checked)
                      }
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleGeneratePassword} 
                  className="w-full"
                >
                  Generate Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Passwords</CardTitle>
            </CardHeader>
            <CardContent>
              {savedPasswords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved passwords yet.</p>
                  <p className="text-sm mt-2">
                    Generate a password and click the save button to store it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedPasswords.map((savedPassword) => (
                    <div 
                      key={savedPassword.id} 
                      className="border rounded-md p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        {editingId === savedPassword.id ? (
                          <div className="flex-1 mr-2">
                            <Input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Enter label"
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="font-medium">
                              {savedPassword.label || 'Untitled Password'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(savedPassword.timestamp)}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-1">
                          {editingId === savedPassword.id ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSaveEdit(savedPassword.id)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Save</span>
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleStartEdit(
                                savedPassword.id, 
                                savedPassword.label
                              )}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeletePassword(savedPassword.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Input
                          value={savedPassword.password}
                          readOnly
                          className="font-mono text-sm pr-12"
                          type="password"
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full"
                          onClick={() => {
                            navigator.clipboard.writeText(savedPassword.password)
                            setCopied(true)
                          }}
                        >
                          <Clipboard className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

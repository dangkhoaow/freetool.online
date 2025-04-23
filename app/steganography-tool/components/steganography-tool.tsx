"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  ImageIcon,
  Upload,
  Download,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Lock,
  Save,
} from "lucide-react"
import {
  encodeTextInImage,
  encodeFileInImage,
  decodeTextFromImage,
  decodeFileFromImage,
  calculateMaxTextLength,
  calculateMaxDataSize,
  formatFileSize,
  saveImageToLocalStorage,
  getSavedImagesFromLocalStorage,
  deleteImageFromLocalStorage,
  clearSavedImagesFromLocalStorage,
} from "@/lib/services/steganography-service"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import AesEncryption from "@/lib/services/aes-encryption"

interface EncryptionOptions {
  algorithm: "aes-256-ctr"
  key: string
}

const aes = new AesEncryption()
aes.setSecretKey("some-default-secret-key") // needs to be 256 bit

// Handle key padding to ensure proper length
const padKey = (key: string): string => {
  // AES-256 needs a 32-byte key (256 bits)
  if (!key) return 'default-key-for-steganography-tool-12345'; // Default if empty
  
  // Create a consistent padding string that won't match parts of the original key
  const paddingString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  // If key is too short, pad it with the padding string
  if (key.length < 32) {
    // Use a different padding technique that won't match substrings
    const paddedKey = key + '#' + paddingString.substring(0, 32 - key.length - 1);
    return paddedKey;
  }
  
  // If key is too long, truncate it
  if (key.length > 32) {
    return key.substring(0, 32);
  }
  
  return key;
};

const encryptText = (text: string, encryptionOptions: EncryptionOptions): string => {
  try {
    // Use a padded key to ensure compatibility
    const paddedKey = padKey(encryptionOptions.key);
    aes.setSecretKey(paddedKey);
    return aes.encrypt(text);
  } catch (error) {
    console.error("Encryption error:", error);
    // If encryption fails, return the original text with a marker
    return `UNENCRYPTED:${text}`;
  }
};

const decryptText = (encryptedText: string, encryptionOptions: EncryptionOptions): string => {
  // Check if text is marked as unencrypted
  if (encryptedText.startsWith('UNENCRYPTED:')) {
    return encryptedText.substring(12); // Remove the marker
  }
  
  // Validate inputs to avoid cryptic errors
  if (!encryptedText || encryptedText.trim().length === 0) {
    throw new Error("Nothing to decrypt - empty text");
  }
  
  try {
    // For backward compatibility, try with the exact key first
    const exactKey = encryptionOptions.key;
    aes.setSecretKey(exactKey);
    
    try {
      // Try decryption with exact key
      const decrypted = aes.decrypt(encryptedText);
      
      // Additional validation to ensure decryption was successful
      if (decrypted && decrypted.trim().length > 0) {
        return decrypted;
      }
      
      // If we got here with no result, throw error to try next method
      throw new Error("Empty result with exact key");
      
    } catch (exactKeyError) {
      // If exact key fails, try with padded key for backward compatibility
      console.log("Trying with padded key for backward compatibility");
      const paddedKey = padKey(encryptionOptions.key);
      aes.setSecretKey(paddedKey);
      
      const decryptedWithPadding = aes.decrypt(encryptedText);
      
      // Validate result
      if (!decryptedWithPadding || decryptedWithPadding.trim().length === 0) {
        throw new Error("Decryption failed with both exact and padded keys");
      }
      
      return decryptedWithPadding;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    // Make the error message more user-friendly
    if (error instanceof Error) {
      // Check if it's our specific error or a general one
      if (error.message.includes("Decryption failed") || 
          error.message.includes("incorrect key")) {
        throw new Error("Incorrect decryption key. Please try a different key.");
      }
    }
    // Fallback error
    throw new Error("Failed to decrypt content. The key may be incorrect.");
  }
};

export default function SteganographyTool() {
  const { toast } = useToast()
  // Tabs state
  const [activeTab, setActiveTab] = useState("encode")

  // Encode tab states
  const [encodeImage, setEncodeImage] = useState<File | null>(null)
  const [encodeImagePreview, setEncodeImagePreview] = useState<string | null>(null)
  const [encodeText, setEncodeText] = useState("")
  const [encodedImageUrl, setEncodedImageUrl] = useState<string | null>(null)
  const [encodeError, setEncodeError] = useState<string | null>(null)
  const [encodeSuccess, setEncodeSuccess] = useState<string | null>(null)
  const [encodeLoading, setEncodeLoading] = useState(false)
  const [maxTextLength, setMaxTextLength] = useState(0)

  // Decode tab states
  const [decodeImage, setDecodeImage] = useState<File | null>(null)
  const [decodeImagePreview, setDecodeImagePreview] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [decodeSuccess, setDecodeSuccess] = useState<string | null>(null)
  const [decodeLoading, setDecodeLoading] = useState(false)

  // Saved images tab states
  const [savedImages, setSavedImages] = useState<
    Record<
      string,
      {
        dataUrl: string
        metadata: {
          originalName: string
          encodedText?: string
          encodedFile?: { fileName: string; mimeType: string; size: number }
          timestamp: number
        }
      }
    >
  >({})
  const [selectedSavedImage, setSelectedSavedImage] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  // Refs
  const encodeFileInputRef = useRef<HTMLInputElement>(null)
  const decodeFileInputRef = useRef<HTMLInputElement>(null)
  const encodedCanvasRef = useRef<HTMLCanvasElement>(null)

  // File encode states
  const [fileToHide, setFileToHide] = useState<File | null>(null)
  const [maxFileSize, setMaxFileSize] = useState(0)
  const [hideMode, setHideMode] = useState<"text" | "file">("text")
  const [showFileSizeWarning, setShowFileSizeWarning] = useState(false)
  const [usedCapacity, setUsedCapacity] = useState(0)
  const [capacityPercentage, setCapacityPercentage] = useState(0)

  // File decode states
  const [decodedFile, setDecodedFile] = useState<{
    data: ArrayBuffer
    fileName: string
    mimeType: string
  } | null>(null)

  const MAX_SAVED_IMAGES = 10

  // Encryption options
  const [encryptionOptions, setEncryptionOptions] = useState<EncryptionOptions>({
    algorithm: "aes-256-ctr",
    key: "some-default-secret-key",
  })

  // Add state for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Load saved images on component mount
  useEffect(() => {
    const images = getSavedImagesFromLocalStorage()
    setSavedImages(images)
  }, [])

  // Handle encode image upload
  const handleEncodeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)
    setFileToHide(null)
    setShowFileSizeWarning(false)

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setEncodeError("Please upload a valid image file (JPG, JPEG, or PNG).")
      return
    }

    setEncodeImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      setEncodeImagePreview(preview)

      // Calculate max text length and file size
      const img = new Image()
      img.onload = () => {
        const maxLength = calculateMaxTextLength(img.width, img.height)
        const maxSize = calculateMaxDataSize(img.width, img.height)
        setMaxTextLength(maxLength)
        setMaxFileSize(maxSize)
        setUsedCapacity(0)
        setCapacityPercentage(0)
        
        // Calculate max file size based on image dimensions (minus some overhead)
        const maxSizeMinusOverhead = Math.floor((img.width * img.height * 3) / 8) - 1024;
        setMaxFileSize(maxSizeMinusOverhead);
        setUsedCapacity(0);
        setCapacityPercentage(0);

        if (maxSizeMinusOverhead < 1024) {
          setShowFileSizeWarning(true);
        } else {
          setShowFileSizeWarning(false);
        }
      }
      img.src = preview
    }
    reader.readAsDataURL(file)
  }

  // Handle file upload for hiding
  const handleFileToHideUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEncodeError(null)
    setEncodeSuccess(null)

    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxFileSize) {
      setEncodeError(`File is too large. Maximum size for this image is ${formatFileSize(maxFileSize)}.`)
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum size is ${formatFileSize(maxFileSize)}`
      });
      return
    }

    setFileToHide(file)
    
    const fileSize = file.size;
    setUsedCapacity(fileSize);
    
    if (maxFileSize > 0) {
      const percentage = Math.min(Math.round((fileSize / maxFileSize) * 100), 100);
      setCapacityPercentage(percentage);
      
      if (fileSize > maxFileSize) {
        toast({
          title: "File too large",
          description: `Maximum size is ${formatFileSize(maxFileSize)}`
        });
      } else if (fileSize > maxFileSize * 0.9) {
        toast({
          title: "File size warning",
          description: `File is ${percentage}% of capacity. This might be close to the limit.`
        });
      }
    }
  }

  // Handle text encoding
  const handleEncode = async () => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)

    if (!encodeImage) {
      setEncodeError("Please upload an image first.")
      return
    }

    if (!encodeText.trim()) {
      setEncodeError("Please enter some text to hide.")
      return
    }

    if (encodeText.length > maxTextLength) {
      setEncodeError(`Text is too long. Maximum length for this image is ${maxTextLength} characters.`)
      return
    }

    setEncodeLoading(true)

    try {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
      }

      // Load the image onto the canvas
      const img = new Image()
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Encrypt the text if encryption is enabled
          let textToEncode = encodeText
          if (encryptionOptions.key.length > 0) {
            textToEncode = encryptText(encodeText, encryptionOptions)
          }

          // Encode the text into the image
          const encodedImageData = encodeTextInImage(imageData, textToEncode)

          // Put the encoded image data back on the canvas
          ctx.putImageData(encodedImageData, 0, 0)

          // Convert the canvas to a data URL
          const dataUrl = canvas.toDataURL("image/png")
          setEncodedImageUrl(dataUrl)

          // No longer directly save to localStorage - let the save button handle this
          setEncodeSuccess("Text successfully hidden in the image! You can now save or download it.")
        } catch (error) {
          setEncodeError((error as Error).message)
        }

        setEncodeLoading(false)
      }

      img.onerror = () => {
        setEncodeError("Failed to load the image.")
        setEncodeLoading(false)
      }

      img.src = encodeImagePreview as string
    } catch (error) {
      setEncodeError("An error occurred while encoding the image.")
      setEncodeLoading(false)
    }
  }

  // Handle file encoding
  const handleEncodeFile = async () => {
    setEncodeError(null)
    setEncodeSuccess(null)
    setEncodedImageUrl(null)

    if (!encodeImage) {
      setEncodeError("Please upload an image first.")
      return
    }

    if (!fileToHide) {
      setEncodeError("Please select a file to hide.")
      return
    }

    if (fileToHide.size > maxFileSize) {
      setEncodeError(`File is too large. Maximum size for this image is ${formatFileSize(maxFileSize)}.`)
      return
    }

    setEncodeLoading(true)

    try {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
      }

      // Load the image onto the canvas
      const img = new Image()
      img.onload = async () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        try {
          // Read the file as ArrayBuffer
          const fileData = await fileToHide.arrayBuffer()
          
          // Get the password if provided
          const password = encryptionOptions.key && encryptionOptions.key.trim() ? 
            encryptionOptions.key : undefined;
          
          // Encode the file into the image with password if provided
          const encodedImageData = encodeFileInImage(
            imageData, 
            fileData, 
            fileToHide.name, 
            fileToHide.type,
            password // Pass the password to encrypt the file
          )

          // Put the encoded image data back on the canvas
          ctx.putImageData(encodedImageData, 0, 0)

          // Convert the canvas to a data URL
          const dataUrl = canvas.toDataURL("image/png")
          setEncodedImageUrl(dataUrl)

          // No longer directly save to localStorage - let the save button handle this
          const successMessage = password ? 
            `File "${fileToHide.name}" successfully hidden and encrypted in the image! You can now save or download it.` :
            `File "${fileToHide.name}" successfully hidden in the image! You can now save or download it.`;
            
          setEncodeSuccess(successMessage)
        } catch (error) {
          setEncodeError((error as Error).message)
        }

        setEncodeLoading(false)
      }

      img.onerror = () => {
        setEncodeError("Failed to load the image.")
        setEncodeLoading(false)
      }

      img.src = encodeImagePreview as string
    } catch (error) {
      setEncodeError("An error occurred while encoding the image.")
      setEncodeLoading(false)
    }
  }

  // Handle decode image upload
  const handleDecodeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecodeError(null)
    setDecodeSuccess(null)
    setDecodedText("")
    setDecodedFile(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setDecodeError("Please upload a valid image file (JPG, JPEG, or PNG).")
      return
    }

    setDecodeImage(file)

    // Create image preview
    const reader = new FileReader()
    reader.onload = (event) => {
      const preview = event.target?.result as string
      setDecodeImagePreview(preview)
    }
    reader.readAsDataURL(file)
  }

  // Process extracted file with password handling
  const processExtractedFile = (file: { 
    data: ArrayBuffer; 
    fileName: string; 
    mimeType: string;
    passwordRequired?: boolean;
  }) => {
    // Set file info for complete file
    setDecodedFile(file);
    
    // Clear any text that might have been set
    setDecodedText("");
    
    // Reset any errors
    setDecodeError(null);
    
    // Set success message with detailed instructions
    const encryptedNote = file.passwordRequired ? " (encrypted)" : "";
    setDecodeSuccess(
      `File "${file.fileName}"${encryptedNote} (${formatFileSize(file.data.byteLength)}) successfully extracted! Click the download button below to save it.`
    );
    
    // Show toast notification to confirm extraction
    toast({
      title: "File Extracted",
      description: `"${file.fileName}" was successfully extracted from the image.`,
      variant: "default",
    });
  };

  // Handle decode button click
  const handleDecode = async () => {
    setDecodeError(null)
    setDecodeSuccess(null)
    setDecodedText("")
    setDecodedFile(null)

    if (!decodeImage && !selectedSavedImage) {
      setDecodeError("Please upload or select an image first.")
      return
    }

    setDecodeLoading(true)
    
    // Safety timeout to prevent UI getting stuck in loading state
    const safetyTimeout = setTimeout(() => {
      if (decodeLoading) {
        console.log("Operation timeout - resetting loading state");
        setDecodeLoading(false);
        setDecodeError("Operation timed out. Please try again with a smaller image or different content.");
      }
    }, 15000); // 15 seconds timeout

    try {
      // Create a canvas to work with the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not create canvas context.")
        setDecodeLoading(false) // Ensure loading state is reset
        clearTimeout(safetyTimeout);
        return
      }

      // Load the image onto the canvas
      const img = new Image()
      
      // Use a promise to better handle async operations
      const decodePromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Set canvas dimensions to match the image
            canvas.width = img.width
            canvas.height = img.height

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0)

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            // Try to detect file first as it's more specific
            try {
              console.log(`[UI] Attempting file decode with password length: ${encryptionOptions.key ? encryptionOptions.key.length : 0}`);
              
              const file = decodeFileFromImage(
                imageData,
                encryptionOptions.key && encryptionOptions.key.trim() ? 
                  encryptionOptions.key : undefined
              );
              
              console.log(`[UI] File decode result:`, {
                hasFileName: !!file.fileName,
                passwordRequired: file.passwordRequired,
                dataSize: file.data.byteLength,
                mimeType: file.mimeType
              });
              
              if (file && file.fileName) {
                // Check if the file is encrypted but has no data (meaning incorrect password)
                if (file.passwordRequired && file.data.byteLength === 0) {
                  console.log(`[UI] Password required but data is empty - incorrect password detected`);
                  
                  // Display debug information if available
                  if (file.debugInfo) {
                    console.log(`[UI] Debug info:`, file.debugInfo);
                  }
                  
                  setDecodeError("This file is password-protected. Please enter the correct password and try again.");
                  setDecodedFile(null); // Don't set file info at all for incorrect password
                  
                  // Add a toast to make the error more visible
                  toast({
                    title: "Password Required",
                    description: "The password you entered is incorrect. Please try again with the correct password.",
                    variant: "destructive",
                  });
                  
                  resolve();
                  return;
                }
                
                // Only process file if it has data or isn't password-protected
                console.log(`[UI] Processing valid file with data size: ${file.data.byteLength}`);
                
                // Add a verification toast when passwordRequired is true and data exists
                if (file.passwordRequired && file.data.byteLength > 0) {
                  console.log(`[UI] Successful decryption with password`);
                  toast({
                    title: "Decryption Successful",
                    description: "The password was accepted and the file was successfully decrypted.",
                    variant: "default",
                  });
                }
                
                processExtractedFile(file);
                resolve();
                return;
              }
            } catch (error) {
              // Type guard for Error objects
              const fileError = error as Error;
              console.log(`[UI] File decode error:`, fileError.message);
              
              // If error mentions password, it's likely a password issue
              if (fileError.message && (
                  fileError.message.includes("password") || 
                  fileError.message.includes("decrypt"))
              ) {
                console.log(`[UI] Password-related error detected`);
                
                // Add more detailed error message for debugging
                let errorMessage = "Incorrect password for the encrypted file.";
                if (process.env.NODE_ENV !== 'production') {
                  errorMessage += ` Error: ${fileError.message}`;
                }
                
                setDecodeError(errorMessage);
                setDecodeLoading(false);
                // Ensure decodedFile is cleared when password is incorrect
                setDecodedFile(null);
                
                // Add a toast to make the error more visible
                toast({
                  title: "Incorrect Password",
                  description: "The file cannot be decrypted with this password. Please try again.",
                  variant: "destructive",
                });
                
                resolve();
                return;
              }
              
              // Otherwise, file extraction failed, continue to try text
              console.log("Not a file, trying text extraction");
            }
            
            // Try text extraction
            try {
              const rawText = decodeTextFromImage(imageData);
              // Check if decoded text looks valid (has reasonable characters)
              if (rawText && rawText.length > 0) {
                // Check if text might actually be JSON file metadata
                try {
                  const jsonObj = JSON.parse(rawText);
                  if (jsonObj.fileName && jsonObj.mimeType) {
                    // This looks like file metadata, handle as file
                    setDecodeError("File metadata found but file data is corrupted. Please try again.");
                    resolve();
                    return;
                  }
                } catch (jsonError) {
                  // Not JSON, continue as normal text
                }
                
                // Only try decryption if we have a key
                if (encryptionOptions.key && encryptionOptions.key.length > 0) {
                  try {
                    const decryptedText = decryptText(rawText, encryptionOptions);
                    if (decryptedText && decryptedText.length > 0) {
                      setDecodedText(decryptedText);
                      setDecodeSuccess("Hidden text successfully extracted!");
                    } else {
                      // Decryption returned empty text
                      setDecodeError("Decryption failed - the key appears to be incorrect.");
                      setDecodedText("");
                    }
                  } catch (decryptError) {
                    // Clear any existing success message
                    setDecodeSuccess(null);
                    // Show explicit error about wrong key
                    setDecodeError("Incorrect decryption key. Please check your key and try again.");
                    
                    // Don't try fallbacks or show raw text when user has specified a key
                    setDecodedText("");
                    // Make sure file data is also cleared
                    setDecodedFile(null);
                  }
                } else {
                  // No key provided, check if text might be encrypted
                  if (rawText.includes("==") || /^[A-Za-z0-9+/]{10,}={0,2}$/.test(rawText)) {
                    // Looks like encrypted text, warn the user
                    setDecodeSuccess(null);
                    setDecodedText(rawText);
                    setDecodeError("This content appears to be encrypted. Please enter a decryption key.");
                  } else {
                    // Show unencrypted text
                    setDecodedText(rawText);
                    setDecodeSuccess("Hidden text successfully extracted!");
                  }
                }
              } else {
                setDecodeError("No valid content detected in this image.");
              }
            } catch (textError) {
              setDecodeError("Could not detect any hidden content in this image.");
            }
            
            resolve();
          } catch (error) {
            setDecodeError("Failed to extract hidden content. This image may not contain any hidden data.");
            reject(error);
          }
        }

        img.onerror = (error) => {
          setDecodeError("Failed to load the image.");
          reject(error);
        }

        // Use either the uploaded image or the selected saved image
        if (selectedSavedImage) {
          img.src = savedImages[selectedSavedImage].dataUrl;
        } else {
          img.src = decodeImagePreview as string;
        }
      });

      // Handle the promise
      await decodePromise
        .catch(error => {
          console.error("Error during decoding:", error);
          setDecodeError("An error occurred while decoding the image.");
        })
        .finally(() => {
          clearTimeout(safetyTimeout); // Always clear the timeout
          setDecodeLoading(false); // Always set loading to false when done
        });
        
    } catch (error) {
      console.error("Error during decode setup:", error);
      setDecodeError("An error occurred while setting up the decoder.");
      setDecodeLoading(false);
      clearTimeout(safetyTimeout);
    }
  }

  // Handle download decoded file
  const handleDownloadDecodedFile = () => {
    if (!decodedFile) {
      toast({
        title: "No File Available",
        description: "There is no file to download. Please extract content first.",
        variant: "destructive",
      });
      return;
    }

    // Prevent downloading empty files (which happens with incorrect passwords)
    if (decodedFile.data.byteLength === 0) {
      toast({
        title: "File Cannot Be Downloaded",
        description: "The file data is empty or encrypted with a different password. Please provide the correct password.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a blob with the correct MIME type
      const blob = new Blob([decodedFile.data], { type: decodedFile.mimeType || 'application/octet-stream' });
      
      // Create a download URL
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = decodedFile.fileName || 'extracted-file';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download Started",
        description: `File "${decodedFile.fileName}" is being downloaded.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Handle download button click
  const handleDownload = () => {
    if (!encodedImageUrl) return

    const link = document.createElement("a")
    link.href = encodedImageUrl
    link.download = `steg-${encodeImage?.name || "image.png"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle delete saved image
  const handleDeleteSavedImage = (key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteImageFromLocalStorage(key)
    setSavedImages(getSavedImagesFromLocalStorage())

    if (selectedSavedImage === key) {
      setSelectedSavedImage(null)
    }
  }

  // Handle clear all images
  const handleClearAllImages = () => {
    clearSavedImagesFromLocalStorage()
    setSavedImages({})
    setSelectedSavedImage(null)
    setStorageWarning(null)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Reset states when switching tabs
    setEncodeError(null)
    setEncodeSuccess(null)
    setDecodeError(null)
    setDecodeSuccess(null)

    // Update saved images when switching to the saved tab
    if (value === "saved") {
      setSavedImages(getSavedImagesFromLocalStorage())
    }
  }

  // Handle save encoded image
  const handleSaveEncodedImage = () => {
    if (!encodedImageUrl || !encodeImage) return;

    try {
      const imageId = `steganography-${Date.now()}-${encodeImage.name}`;
      const timestamp = Date.now();

      // Metadata to store with the image
      const metadata = {
        originalName: encodeImage.name,
        encodedText: hideMode === "text" ? encodeText : undefined,
        encodedFile: hideMode === "file" && fileToHide ? {
          fileName: fileToHide.name,
          mimeType: fileToHide.type,
          size: fileToHide.size
        } : undefined,
        timestamp
      };

      try {
        // Clear any previous warnings
        setStorageWarning(null);
        
        // Try to save the image
        saveImageToLocalStorage(imageId, encodedImageUrl, metadata);
        
        // Success! Update UI
        setEncodeSuccess("Image saved successfully. You can access it in the 'Saved Images' tab.");
        
        // Update saved images in case user switches to that tab
        setSavedImages(getSavedImagesFromLocalStorage());
      } catch (storageError) {
        // Handle specific localStorage errors
        if (storageError instanceof Error) {
          // If image too large or quota exceeded
          if (storageError.message.includes("too large") || 
              storageError.message.includes("quota")) {
            
            setEncodeError("Unable to save: " + storageError.message);
            setStorageWarning("The browser's storage limit was reached. We recommend downloading this image instead.");
            
            // Suggest downloading instead
            toast({
              title: "Storage Space Full",
              description: "Your image couldn't be saved. Please download it instead.",
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                >
                  Download Now
                </Button>
              )
            });
          } else {
            // Other storage errors
            setEncodeError("Error saving image: " + storageError.message);
            setStorageWarning("Try clearing some images from the 'Saved Images' tab.");
            
            toast({
              title: "Storage Error",
              description: "Consider managing your saved images.",
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleTabChange('saved')}
                >
                  Manage Images
                </Button>
              )
            });
          }
        } else {
          // Fallback for unknown errors
          setEncodeError("Failed to save image due to an unknown error. Please try downloading instead.");
        }
      }
    } catch (error) {
      console.error("Error in save process:", error);
      setEncodeError("An unexpected error occurred. Please try downloading your image instead.");
      
      // Always offer download as fallback
      toast({
        title: "Save Failed",
        description: "Would you like to download the image instead?",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
          >
            Download
          </Button>
        )
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Steganography Tool</CardTitle>
        <CardDescription>
          Hide secret text messages or files within images or extract hidden content from images.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="encode" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="encode">Hide Content</TabsTrigger>
            <TabsTrigger value="decode">Extract Content</TabsTrigger>
            <TabsTrigger value="saved">Saved Images</TabsTrigger>
          </TabsList>

          {/* Encode Tab */}
          <TabsContent value="encode" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="encode-image">Upload Image</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      encodeError ? "border-red-300 dark:border-red-800" : "border-gray-300 dark:border-gray-600",
                    )}
                    onClick={() => encodeFileInputRef.current?.click()}
                  >
                    <input
                      ref={encodeFileInputRef}
                      id="encode-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={handleEncodeImageUpload}
                    />
                    {encodeImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={encodeImagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload an image or drag and drop</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {encodeImagePreview && (
                  <>
                    <div className="space-y-2">
                      <Label>What would you like to hide?</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={hideMode === "text" ? "default" : "outline"}
                          onClick={() => setHideMode("text")}
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Text
                        </Button>
                        <Button
                          type="button"
                          variant={hideMode === "file" ? "default" : "outline"}
                          onClick={() => setHideMode("file")}
                          className="flex-1"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          File
                        </Button>
                      </div>
                    </div>

                    {hideMode === "text" && (
                      <div className="space-y-2">
                        <Label htmlFor="encode-text">Text to Hide</Label>
                        <Textarea
                          id="encode-text"
                          placeholder="Enter the secret text you want to hide in the image..."
                          value={encodeText}
                          onChange={(e) => setEncodeText(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {encodeText.length} / {maxTextLength} characters
                        </p>
                      </div>
                    )}

                    {/* Encryption Options */}
                    <div className="space-y-2">
                      <Label htmlFor="encryption-key">Encryption Key</Label>
                      <div className="relative">
                        <Input
                          id="encryption-key"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter encryption key"
                          value={encryptionOptions.key}
                          onChange={(e) => setEncryptionOptions({ ...encryptionOptions, key: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter a key to encrypt the hidden text. Keep this key safe, as it will be needed to decrypt the
                        message.
                      </p>
                    </div>

                    {hideMode === "file" && (
                      <div className="space-y-2">
                        <Label htmlFor="file-to-hide">File to Hide</Label>
                        {showFileSizeWarning && (
                          <Alert className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <AlertTitle>Small Image Warning</AlertTitle>
                            <AlertDescription>
                              This image can only store up to {formatFileSize(maxFileSize)}. For larger files, please use a bigger image.
                            </AlertDescription>
                          </Alert>
                        )}
                        {maxFileSize > 0 && (
                          <div className="mb-2 text-sm">
                            <div className="flex justify-between mb-1">
                              <span>Storage capacity: {formatFileSize(usedCapacity)} of {formatFileSize(maxFileSize)}</span>
                              <span className={capacityPercentage > 90 ? "text-red-500 dark:text-red-400 font-medium" : ""}>{capacityPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  capacityPercentage > 90 ? "bg-red-500" : 
                                  capacityPercentage > 70 ? "bg-yellow-500" : "bg-green-500"
                                }`} 
                                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                            encodeError ? "border-red-300 dark:border-red-800" : "border-gray-300 dark:border-gray-600",
                          )}
                          onClick={() => document.getElementById("file-to-hide")?.click()}
                        >
                          <input id="file-to-hide" type="file" className="hidden" onChange={handleFileToHideUpload} />
                          {fileToHide ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="h-10 w-10 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium">{fileToHide.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(fileToHide.size)} / {formatFileSize(maxFileSize)} ({Math.round((fileToHide.size / maxFileSize) * 100)}% of capacity)</p>
                              <p className="text-xs text-gray-500">Click to change file</p>
                            </div>
                          ) : (
                            <div className="py-4">
                              <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">Click to select a file to hide</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Maximum size: {formatFileSize(maxFileSize)}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">For larger files, use a bigger image.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {encodeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{encodeError}</AlertDescription>
                  </Alert>
                )}

                {encodeSuccess && (
                  <Alert className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{encodeSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={hideMode === "text" ? handleEncode : handleEncodeFile}
                  disabled={
                    !encodeImagePreview || (hideMode === "text" ? !encodeText.trim() : !fileToHide) || encodeLoading
                  }
                  className="w-full"
                >
                  {encodeLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      {hideMode === "text" ? "Hiding Text..." : "Hiding File..."}
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      {hideMode === "text" ? "Hide Text in Image" : "Hide File in Image"}
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column - Result */}
              <div className="space-y-4">
                {encodedImageUrl ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 dark:border-gray-700">
                      <h3 className="text-sm font-medium mb-2">Encoded Image</h3>
                      <img
                        src={encodedImageUrl || "/placeholder.svg"}
                        alt="Encoded"
                        className="max-h-48 mx-auto object-contain"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        The image now contains your hidden {hideMode === "text" ? "message" : "file"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveEncodedImage} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save to Browser
                      </Button>
                      <Button onClick={handleDownload} className="flex-1" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    {storageWarning && (
                      <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <AlertTitle>Storage Warning</AlertTitle>
                        <AlertDescription>{storageWarning}</AlertDescription>
                      </Alert>
                    )}

                    <Alert className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                      <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertTitle>Privacy Note</AlertTitle>
                      <AlertDescription>
                        Your image has been processed entirely in your browser. Nothing was uploaded to any server.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                      <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Encoded Image Preview</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Upload an image and {hideMode === "text" ? "enter text" : "select a file"} to hide, then click
                        the "{hideMode === "text" ? "Hide Text in Image" : "Hide File in Image"}" button.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Decode Tab */}
          <TabsContent value="decode" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="decode-image">Upload Image with Hidden Content</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                      decodeError ? "border-red-300 dark:border-red-800" : "border-gray-300 dark:border-gray-600",
                    )}
                    onClick={() => decodeFileInputRef.current?.click()}
                  >
                    <input
                      ref={decodeFileInputRef}
                      id="decode-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={handleDecodeImageUpload}
                    />
                    {decodeImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={decodeImagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-48 mx-auto object-contain"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to change image</p>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload an image or drag and drop</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Encryption Options */}
                <div className="space-y-2">
                  <Label htmlFor="decryption-key">Decryption Key</Label>
                  <div className="relative">
                    <Input
                      id="decryption-key"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter decryption key"
                      value={encryptionOptions.key}
                      onChange={(e) => setEncryptionOptions({ ...encryptionOptions, key: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enter the key used to encrypt the hidden content.</p>
                </div>

                {decodeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{decodeError}</AlertDescription>
                  </Alert>
                )}

                {decodeSuccess && (
                  <Alert className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{decodeSuccess}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleDecode}
                  disabled={(!decodeImagePreview && !selectedSavedImage) || decodeLoading}
                  className="w-full relative"
                >
                  {decodeLoading ? (
                    <>
                      <Spinner className="mr-2 animate-spin" />
                      <span>Extracting Content...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Extract Hidden Content
                    </>
                  )}
                </Button>
              </div>

              {/* Right Column - Result */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4 h-full dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-2">Extracted Content</h3>
                  {decodedText ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md min-h-[200px] max-h-[300px] overflow-y-auto">
                      <p className="whitespace-pre-wrap">{decodedText}</p>
                    </div>
                  ) : decodedFile ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md min-h-[200px] flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-2" />
                      <h4 className="font-medium text-lg">{decodedFile.fileName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {formatFileSize(decodedFile.data.byteLength)} • {decodedFile.mimeType}
                      </p>
                      <Button 
                        onClick={handleDownloadDecodedFile}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="text-center p-6">
                        <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload an image with hidden content and click "Extract Hidden Content"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {(decodedText || decodedFile) && (
                  <Alert className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                    <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Privacy Note</AlertTitle>
                    <AlertDescription>
                      Your image has been processed entirely in your browser. Nothing was uploaded to any server.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Saved Images Tab */}
          <TabsContent value="saved" className="space-y-4">
            {Object.keys(savedImages).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Saved Images */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Your Saved Images</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(savedImages)
                      .sort(([, a], [, b]) => b.metadata.timestamp - a.metadata.timestamp)
                      .map(([key, { dataUrl, metadata }]) => (
                        <div
                          key={key}
                          className={cn(
                            "border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                            selectedSavedImage === key && "border-blue-500 bg-blue-50",
                          )}
                          onClick={() => setSelectedSavedImage(key)}
                        >
                          <img
                            src={dataUrl || "/placeholder.svg"}
                            alt={metadata.originalName}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{metadata.originalName}</p>
                            <p className="text-xs text-gray-500">{new Date(metadata.timestamp).toLocaleString()}</p>
                            {metadata.encodedText && (
                              <p className="text-xs text-gray-500 truncate">
                                Contains hidden text ({metadata.encodedText.length} chars)
                              </p>
                            )}
                            {metadata.encodedFile && (
                              <p className="text-xs text-gray-500 truncate">
                                Contains hidden file: {metadata.encodedFile.fileName} (
                                {formatFileSize(metadata.encodedFile.size)})
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500"
                            onClick={(e) => handleDeleteSavedImage(key, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  {storageWarning && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Storage Full</AlertTitle>
                      <AlertDescription>{storageWarning}</AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" size="sm" onClick={handleClearAllImages}>
                    Clear All Images
                  </Button>
                </div>

                {/* Right Column - Selected Image */}
                <div className="space-y-4">
                  {selectedSavedImage ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Selected Image</h3>
                        <img
                          src={savedImages[selectedSavedImage].dataUrl || "/placeholder.svg"}
                          alt="Selected"
                          className="max-h-48 mx-auto object-contain"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setActiveTab("decode")
                            setDecodeImagePreview(null)
                            setDecodeImage(null)
                            // The decode function will use the selectedSavedImage
                          }}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Extract Content
                        </Button>

                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = savedImages[selectedSavedImage].dataUrl
                            link.download = `steg-${savedImages[selectedSavedImage].metadata.originalName}`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
                        <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Image Selected</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Select an image from the list to view details and options.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Save className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Saved Images</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Images with hidden content will be saved here automatically.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("encode")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Hide Content in an Image
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


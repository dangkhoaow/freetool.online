/**
 * Steganography Service
 *
 * This service provides functions for encoding text into images and decoding text from images
 * using the Least Significant Bit (LSB) steganography technique.
 */

// Maximum data size that can be encoded in an image (in bytes)
export const calculateMaxDataSize = (width: number, height: number): number => {
  // Each pixel can store 3 bits (one in each RGB channel)
  // We reserve the first 32 pixels (96 bits) to store the data length
  // We reserve another 32 pixels (96 bits) to store the filename and mime type length
  const totalBits = width * height * 3
  const availableBits = totalBits - 96 - 96
  // Convert bits to bytes (8 bits per byte)
  return Math.floor(availableBits / 8)
}

// Convert ArrayBuffer to binary string
const arrayBufferToBinary = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += bytes[i].toString(2).padStart(8, "0")
  }
  return binary
}

// Convert binary string to ArrayBuffer
const binaryToArrayBuffer = (binary: string): ArrayBuffer => {
  const bytes = new Uint8Array(Math.ceil(binary.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    const byteString = binary.substr(i * 8, 8)
    bytes[i] = byteString ? Number.parseInt(byteString, 2) : 0
  }
  return bytes.buffer
}

// Convert string to binary
const stringToBinary = (str: string): string => {
  let binary = ""
  for (let i = 0; i < str.length; i++) {
    binary += str.charCodeAt(i).toString(2).padStart(16, "0")
  }
  return binary
}

// Convert binary to string
const binaryToString = (binary: string): string => {
  let str = ""
  for (let i = 0; i < binary.length; i += 16) {
    const charCode = Number.parseInt(binary.substr(i, 16), 2)
    str += String.fromCharCode(charCode)
  }
  return str
}

// Maximum text length that can be encoded in an image
export const calculateMaxTextLength = (width: number, height: number): number => {
  // Each pixel can store 3 bits (one in each RGB channel)
  // We reserve the first 32 pixels (96 bits) to store the text length
  const totalBits = width * height * 3
  const availableBits = totalBits - 96
  // Each character takes 16 bits (for Unicode support)
  return Math.floor(availableBits / 16)
}

// Convert text to binary
const textToBinary = (text: string): string => {
  let binary = ""
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    // Convert to 16-bit binary (for Unicode support)
    binary += charCode.toString(2).padStart(16, "0")
  }
  return binary
}

// Convert binary to text
const binaryToText = (binary: string): string => {
  let text = ""
  // Process 16 bits at a time (for Unicode support)
  for (let i = 0; i < binary.length; i += 16) {
    const charCode = Number.parseInt(binary.substr(i, 16), 2)
    text += String.fromCharCode(charCode)
  }
  return text
}

// Encode text into an image
export const encodeTextInImage = (imageData: ImageData, text: string): ImageData => {
  const { width, height, data } = imageData

  // Check if text is too long for the image
  const maxLength = calculateMaxTextLength(width, height)
  if (text.length > maxLength) {
    throw new Error(`Text is too long. Maximum length for this image is ${maxLength} characters.`)
  }

  // Convert text to binary
  const textLength = text.length
  const textLengthBinary = textLength.toString(2).padStart(32, "0")
  const textBinary = textToBinary(text)
  const binaryData = textLengthBinary + textBinary

  // Encode binary data into image
  let binaryIndex = 0

  // Clone the image data to avoid modifying the original
  const newData = new Uint8ClampedArray(data)

  // Encode each bit of binary data into the least significant bit of each color channel
  for (let i = 0; i < newData.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (binaryIndex < binaryData.length) {
        // Clear the least significant bit
        newData[i + j] = newData[i + j] & 0xfe
        // Set the least significant bit to the current binary bit
        newData[i + j] = newData[i + j] | Number.parseInt(binaryData[binaryIndex])
        binaryIndex++
      } else {
        break
      }
    }

    if (binaryIndex >= binaryData.length) {
      break
    }
  }

  return new ImageData(newData, width, height)
}

// Decode text from an image
export const decodeTextFromImage = (imageData: ImageData): string => {
  const { width, height, data } = imageData

  // Extract binary data from image
  let binaryData = ""
  let bitsExtracted = 0
  const totalBitsNeeded = 32 // Initially, we only need to extract the length

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalBitsNeeded) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalBitsNeeded) {
      break
    }
  }

  // Parse the text length from the first 32 bits
  const textLength = Number.parseInt(binaryData.substr(0, 32), 2)

  // Check if the decoded length is valid
  if (isNaN(textLength) || textLength <= 0 || textLength > calculateMaxTextLength(width, height)) {
    throw new Error("No hidden text found or the image has been corrupted.")
  }

  // Now extract the actual text data
  binaryData = ""
  bitsExtracted = 0
  const totalTextBits = textLength * 16 + 32 // 16 bits per character + 32 bits for length

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalTextBits) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalTextBits) {
      break
    }
  }

  // Skip the first 32 bits (length) and convert the rest to text
  return binaryToText(binaryData.substr(32, textLength * 16))
}

// Encode file into an image
export const encodeFileInImage = (
  imageData: ImageData,
  fileData: ArrayBuffer,
  fileName: string,
  mimeType: string,
): ImageData => {
  const { width, height, data } = imageData

  // Create metadata string (filename and mimetype)
  const metadata = JSON.stringify({ fileName, mimeType })

  // Check if file is too large for the image
  const maxSize = calculateMaxDataSize(width, height)
  if (fileData.byteLength > maxSize) {
    throw new Error(`File is too large. Maximum size for this image is ${formatFileSize(maxSize)}.`)
  }

  // Convert file data to binary
  const fileSizeBinary = fileData.byteLength.toString(2).padStart(32, "0")
  const metadataBinary = stringToBinary(metadata)
  const metadataSizeBinary = metadataBinary.length.toString(2).padStart(32, "0")
  const fileBinary = arrayBufferToBinary(fileData)

  // Combine all binary data
  const binaryData = metadataSizeBinary + metadataBinary + fileSizeBinary + fileBinary

  // Encode binary data into image
  let binaryIndex = 0

  // Clone the image data to avoid modifying the original
  const newData = new Uint8ClampedArray(data)

  // Encode each bit of binary data into the least significant bit of each color channel
  for (let i = 0; i < newData.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (binaryIndex < binaryData.length) {
        // Clear the least significant bit
        newData[i + j] = newData[i + j] & 0xfe
        // Set the least significant bit to the current binary bit
        newData[i + j] = newData[i + j] | Number.parseInt(binaryData[binaryIndex])
        binaryIndex++
      } else {
        break
      }
    }

    if (binaryIndex >= binaryData.length) {
      break
    }
  }

  return new ImageData(newData, width, height)
}

// Decode file from an image
export const decodeFileFromImage = (
  imageData: ImageData,
): {
  data: ArrayBuffer
  fileName: string
  mimeType: string
} => {
  const { width, height, data } = imageData

  // Extract binary data from image
  let binaryData = ""
  let bitsExtracted = 0
  let totalBitsNeeded = 32 // Initially, we only need to extract the metadata size

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalBitsNeeded) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalBitsNeeded) {
      break
    }
  }

  // Parse the metadata size from the first 32 bits
  const metadataSize = Number.parseInt(binaryData.substr(0, 32), 2)

  if (isNaN(metadataSize) || metadataSize <= 0 || metadataSize > 10000) {
    throw new Error("No hidden file found or the image has been corrupted.")
  }

  // Now extract the metadata
  binaryData = ""
  bitsExtracted = 0
  totalBitsNeeded = 32 + metadataSize // 32 bits for metadata size + metadata

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalBitsNeeded) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalBitsNeeded) {
      break
    }
  }

  // Skip the first 32 bits (metadata size) and convert the rest to metadata
  const metadataString = binaryToString(binaryData.substr(32, metadataSize))
  const metadata = JSON.parse(metadataString)

  // Now extract the file size
  binaryData = ""
  bitsExtracted = 0
  totalBitsNeeded = 32 + metadataSize + 32 // Add 32 bits for file size

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalBitsNeeded) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalBitsNeeded) {
      break
    }
  }

  // Parse the file size from the bits after metadata
  const fileSize = Number.parseInt(binaryData.substr(32 + metadataSize, 32), 2)

  if (isNaN(fileSize) || fileSize <= 0 || fileSize > calculateMaxDataSize(width, height)) {
    throw new Error("The file data is corrupted or invalid.")
  }

  // Finally extract the file data
  binaryData = ""
  bitsExtracted = 0
  totalBitsNeeded = 32 + metadataSize + 32 + fileSize * 8 // Add file size in bits

  // Extract each bit from the least significant bit of each color channel
  for (let i = 0; i < data.length; i += 4) {
    // Skip alpha channel (i+3)
    for (let j = 0; j < 3; j++) {
      if (bitsExtracted < totalBitsNeeded) {
        // Extract the least significant bit
        binaryData += (data[i + j] & 0x01).toString()
        bitsExtracted++
      } else {
        break
      }
    }

    if (bitsExtracted >= totalBitsNeeded) {
      break
    }
  }

  // Skip the metadata and file size bits and convert the rest to file data
  const fileBinary = binaryData.substr(32 + metadataSize + 32, fileSize * 8)
  const fileData = binaryToArrayBuffer(fileBinary)

  return {
    data: fileData,
    fileName: metadata.fileName,
    mimeType: metadata.mimeType,
  }
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Save image to localStorage
export const saveImageToLocalStorage = (
  key: string,
  dataUrl: string,
  metadata: {
    originalName: string
    encodedText?: string
    encodedFile?: {
      fileName: string
      mimeType: string
      size: number
    }
    timestamp: number
  },
): void => {
  try {
    const savedImages = JSON.parse(localStorage.getItem("steganography-images") || "{}")
    savedImages[key] = {
      dataUrl,
      metadata,
    }
    localStorage.setItem("steganography-images", JSON.stringify(savedImages))
  } catch (error) {
    console.error("Error saving image to localStorage:", error)
    throw new Error("Failed to save image. Storage may be full.")
  }
}

// Get all saved images from localStorage
export const getSavedImagesFromLocalStorage = (): Record<
  string,
  {
    dataUrl: string
    metadata: {
      originalName: string
      encodedText?: string
      encodedFile?: {
        fileName: string
        mimeType: string
        size: number
      }
      timestamp: number
    }
  }
> => {
  try {
    return JSON.parse(localStorage.getItem("steganography-images") || "{}")
  } catch (error) {
    console.error("Error getting images from localStorage:", error)
    return {}
  }
}

// Delete image from localStorage
export const deleteImageFromLocalStorage = (key: string): void => {
  try {
    const savedImages = JSON.parse(localStorage.getItem("steganography-images") || "{}")
    delete savedImages[key]
    localStorage.setItem("steganography-images", JSON.stringify(savedImages))
  } catch (error) {
    console.error("Error deleting image from localStorage:", error)
  }
}

// Clear all saved images from localStorage
export const clearSavedImagesFromLocalStorage = (): void => {
  try {
    localStorage.removeItem("steganography-images")
  } catch (error) {
    console.error("Error clearing images from localStorage:", error)
  }
}

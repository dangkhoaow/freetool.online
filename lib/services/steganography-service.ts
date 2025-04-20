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
  // and 96 more bits for additional metadata (like encryption flag)
  
  // The total available bits is the number of pixels * 3 (R,G,B channels)
  const totalBits = width * height * 3
  
  // We need to reserve some bits for metadata
  const metadataBits = 96 + 96 + 96 // 288 bits for metadata
  
  // Available bits for actual data
  const availableBits = totalBits - metadataBits
  
  // Convert bits to bytes (8 bits per byte) and apply a safety margin
  // Use 85% of available space to ensure we don't run into edge cases
  return Math.max(100, Math.floor(availableBits / 8 * 0.85))
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

// Simple XOR encryption/decryption for file data
const simpleXorEncrypt = (text: string, password: string): string => {
  // Add a unique password signature to prevent similar passwords from working
  const passwordSignature = `||PASS=${password}||`;
  
  // For encryption, we prepend the signature 
  if (text.indexOf('VALID_PASSWORD_TOKEN||') === 0) {
    // We're encrypting, add the signature right after the token
    text = text.replace('VALID_PASSWORD_TOKEN||', 'VALID_PASSWORD_TOKEN||' + passwordSignature);
  }
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const passChar = password.charCodeAt(i % password.length);
    const textChar = text.charCodeAt(i);
    result += String.fromCharCode(textChar ^ passChar);
  }
  return result;
}

// Enhanced file encoding with password protection
export const encodeFileInImage = (
  imageData: ImageData,
  fileData: ArrayBuffer,
  fileName: string,
  mimeType: string,
  password?: string // Add optional password parameter
): ImageData => {
  const { width, height, data } = imageData
  
  console.log(`[Encoding] Starting file encoding with password? ${Boolean(password)}`);
  console.log(`[Encoding] File details: ${fileName}, ${mimeType}, size: ${fileData.byteLength} bytes`);

  // Create metadata string (filename, mimetype, and password indicator)
  // Add a password indicator to the metadata
  const hasPassword = !!password
  const metadata = JSON.stringify({ 
    fileName, 
    mimeType,
    encrypted: hasPassword, // Flag to indicate if this file is encrypted
    passwordRequired: hasPassword, // Backward compatibility flag
    timestamp: Date.now(), // Add timestamp for versioning
    // The token will now be added to the beginning of the actual file data 
    // rather than in the metadata
  })
  
  console.log(`[Encoding] Created metadata:`, JSON.parse(metadata));

  // Check if file is too large for the image
  const maxSize = calculateMaxDataSize(width, height)
  
  // Convert file to binary
  let fileBytes = new Uint8Array(fileData)
  
  // If password provided, encrypt the file data before encoding
  if (password) {
    try {
      console.log(`[Encoding] Encrypting file with password length: ${password.length}`);
      
      // Add a verification token to the beginning of the file data
      // This will be used to verify the password during decryption
      const verificationBytes = new TextEncoder().encode("VALID_PASSWORD_TOKEN||");
      
      // Combine verification token and file data
      const combinedBytes = new Uint8Array(verificationBytes.length + fileBytes.length);
      combinedBytes.set(verificationBytes, 0);
      combinedBytes.set(fileBytes, verificationBytes.length);
      
      // Convert to string for XOR encryption
      const combinedString = Array.from(combinedBytes)
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      // Simple XOR encryption for the combined data
      const encryptedString = simpleXorEncrypt(combinedString, password);
      
      // Convert encrypted string back to bytes
      fileBytes = new Uint8Array(encryptedString.split('').map(c => c.charCodeAt(0)));
      
      console.log(`[Encoding] Encryption complete. Original size: ${fileData.byteLength}, Encrypted size: ${fileBytes.length}`);
      
      // If encryption increases the size too much, throw an error
      if (fileBytes.length > maxSize) {
        throw new Error(`Encrypted file is too large. Maximum size is ${formatFileSize(maxSize)}.`)
      }
    } catch (e) {
      console.error("File encryption failed:", e)
      throw new Error("Failed to encrypt file data. Please try again with a different password.")
    }
  }
  
  // Check again after potential encryption
  if (fileBytes.length > maxSize) {
    throw new Error(`File is too large. Maximum size for this image is ${formatFileSize(maxSize)}.`)
  }

  // Convert file data to binary
  const fileSizeBinary = fileBytes.length.toString(2).padStart(32, "0")
  const metadataBinary = stringToBinary(metadata)
  const metadataSizeBinary = metadataBinary.length.toString(2).padStart(32, "0")
  const fileBinary = arrayBufferToBinary(fileBytes.buffer)

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

// Enhanced file decoding with password support
export const decodeFileFromImage = (
  imageData: ImageData,
  password?: string, // Add optional password parameter
  debugMode: boolean = false // Set debug mode to false by default
): {
  data: ArrayBuffer
  fileName: string
  mimeType: string
  passwordRequired?: boolean // Add flag to indicate if password is required
  debugInfo?: any // Debug info for troubleshooting
} => {
  const { width, height, data } = imageData
  const debugLog: any[] = [];
  
  if (debugMode) {
    console.log(`[DEBUG] Starting file decoding with password? ${Boolean(password)}`);
  }

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
  
  if (debugMode) {
    console.log(`[DEBUG] Extracted metadata:`, metadata);
  }

  // Check if this file requires a password
  const isEncrypted = metadata.encrypted || metadata.passwordRequired
  
  if (debugMode) {
    debugLog.push({
      step: 'metadata', 
      isEncrypted, 
      fileName: metadata.fileName,
      mimeType: metadata.mimeType,
      timestamp: metadata.timestamp
    });
  }
  
  // If file is encrypted but no password provided, return error metadata
  if (isEncrypted && !password) {
    return {
      data: new ArrayBuffer(0), // Empty data
      fileName: metadata.fileName,
      mimeType: metadata.mimeType,
      passwordRequired: true, // Indicate password is required
      debugInfo: debugMode ? debugLog : undefined
    };
  }

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
  
  if (debugMode) {
    debugLog.push({step: 'fileSize', size: fileSize});
    console.log(`[DEBUG] File size: ${fileSize} bytes`);
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
  let fileData = binaryToArrayBuffer(fileBinary)
  
  if (debugMode) {
    debugLog.push({step: 'extractedData', dataSize: fileData.byteLength});
  }

  // If file is encrypted and password provided, decrypt it
  if (isEncrypted && password) {
    try {
      // Convert ArrayBuffer to string for decryption
      const fileBytes = new Uint8Array(fileData);
      const fileString = Array.from(fileBytes)
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      console.log(`[Decryption] Attempt decrypt with password length: ${password.length}`);
      if (debugMode) {
        debugLog.push({step: 'decryption', passwordLength: password.length});
      }
      
      // Decrypt the file data with the provided password
      const decryptedString = simpleXorEncrypt(fileString, password); // XOR is symmetric
      
      // Check for the verification token at the beginning of the decrypted data
      const verificationToken = "VALID_PASSWORD_TOKEN||";
      if (decryptedString.startsWith(verificationToken)) {
        console.log(`[Decryption] Verification token found - password is correct`);
        
        // Check for the password signature that follows the token
        const passwordSignature = `||PASS=${password}||`;
        const expectedSignatureStart = verificationToken + passwordSignature;
        
        if (!decryptedString.startsWith(expectedSignatureStart)) {
          console.log(`[Decryption] Password signature mismatch - wrong password`);
          if (debugMode) {
            debugLog.push({step: 'validation', method: 'signature', valid: false});
          }
          throw new Error("Incorrect password. The file cannot be properly decrypted.");
        }
        
        if (debugMode) {
          debugLog.push({step: 'validation', method: 'token', valid: true});
        }
        
        // Remove the verification token and password signature from the decrypted data
        const actualFileString = decryptedString.substring(expectedSignatureStart.length);
        console.log(`[Decryption] Extracted file data after token removal (length: ${actualFileString.length})`);
        
        // Convert the actual file data back to ArrayBuffer
        const actualFileBytes = new Uint8Array(actualFileString.split('').map(c => c.charCodeAt(0)));
        fileData = actualFileBytes.buffer;
        
        return {
          data: fileData,
          fileName: metadata.fileName,
          mimeType: metadata.mimeType,
          passwordRequired: isEncrypted,
          debugInfo: debugMode ? debugLog : undefined
        };
      }
      
      console.log(`[Decryption] Verification token not found, using heuristic validation`);
      
      // Add validation to check if password is correct by looking for expected patterns
      if (debugMode) {
        debugLog.push({step: 'validation', method: 'heuristic', reason: 'No verification token found'});
      }
      
      // Simple validation: Check for reasonable text or binary content
      const sampleBytes = decryptedString.slice(0, Math.min(100, decryptedString.length))
                       .split('').map(c => c.charCodeAt(0));
      
      const invalidChars = sampleBytes.filter(b => (b < 9 || (b > 13 && b < 32)) && b !== 0).length;
      const tooManyZeros = sampleBytes.filter(b => b === 0).length > 50;
      const extremeValues = sampleBytes.filter(b => b > 250).length > 20;
      
      // Binary files can have many zeros but should have reasonable distribution
      const isBinaryFile = /^(image\/|application\/|video\/|audio\/)/.test(metadata.mimeType);
      
      // We should consider any file with more than 5 invalid characters as invalid
      let seemsValid = false;
      if (isBinaryFile) {
        seemsValid = invalidChars <= 5 && !extremeValues;
      } else {
        seemsValid = invalidChars <= 5 && !tooManyZeros;
      }
      
      if (debugMode) {
        console.log(`[Decryption] Heuristic validation: 
          InvalidChars: ${invalidChars}, 
          TooManyZeros: ${tooManyZeros}, 
          ExtremeValues: ${extremeValues}, 
          SeemValid: ${seemsValid}`);
        
        debugLog.push({
          step: 'heuristicValidation',
          invalidChars,
          tooManyZeros,
          extremeValues,
          isBinaryFile,
          seemsValid
        });
      }
      
      // Reject obviously invalid decryptions
      if (!seemsValid) {
        console.log(`[Decryption] Data looks invalid after decryption - likely wrong password`);
        throw new Error("Incorrect password. The file cannot be properly decrypted.");
      }
      
      // If we get here, the data passes heuristic validation for older files
      console.log(`[Decryption] Using heuristic validation (less secure) - file seems valid`);
      
      // Convert decrypted string back to ArrayBuffer
      const allDecryptedBytes = new Uint8Array(decryptedString.split('').map(c => c.charCodeAt(0)));
      fileData = allDecryptedBytes.buffer;
      
    } catch (e) {
      console.error("File decryption failed:", e);
      // Return empty data with metadata and password required flag
      if (debugMode) {
        debugLog.push({step: 'error', message: (e as Error).message});
        console.log(`[DEBUG] Decryption error:`, e);
      }
      return {
        data: new ArrayBuffer(0),
        fileName: metadata.fileName,
        mimeType: metadata.mimeType,
        passwordRequired: true,
        debugInfo: debugMode ? debugLog : undefined
      };
    }
  }

  return {
    data: fileData,
    fileName: metadata.fileName,
    mimeType: metadata.mimeType,
    passwordRequired: isEncrypted,
    debugInfo: debugMode ? debugLog : undefined
  }
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// Save image to localStorage with quota management
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
    // Check the size of the current image data
    const currentImageSize = new Blob([dataUrl]).size;
    
    // If the current image is too large (over 2MB), resize it or reject it
    if (currentImageSize > 2 * 1024 * 1024) {
      throw new Error("The image is too large to store. Please download it instead.");
    }
    
    // Get current saved images
    const savedImages = JSON.parse(localStorage.getItem("steganography-images") || "{}")
    
    // Enforce a maximum number of saved images (5) to prevent quota issues
    const MAX_SAVED_IMAGES = 5;
    
    // If we already have too many images, remove the oldest ones
    const keys = Object.keys(savedImages);
    if (keys.length >= MAX_SAVED_IMAGES) {
      // Sort by timestamp (oldest first)
      const sortedKeys = keys.sort((a, b) => 
        savedImages[a].metadata.timestamp - savedImages[b].metadata.timestamp
      );
      
      // Remove oldest images to stay under the limit
      const keysToRemove = sortedKeys.slice(0, keys.length - MAX_SAVED_IMAGES + 1);
      keysToRemove.forEach(oldKey => {
        delete savedImages[oldKey];
      });
    }
    
    // Compress the image URL before storing if it's large
    let compressedDataUrl = dataUrl;
    if (currentImageSize > 500 * 1024) { // If over 500KB
      try {
        const img = new Image();
        img.src = dataUrl;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Wait for image to load
        if (img.complete) {
          // Use a smaller canvas size to reduce file size while preserving data
          const scaleFactor = Math.min(1, Math.sqrt(500 * 1024 / currentImageSize));
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          // IMPORTANT: Must use PNG format to preserve steganography data
          // Using JPEG would destroy the hidden data in the least significant bits
          compressedDataUrl = canvas.toDataURL('image/png');
        }
      } catch (e) {
        // If compression fails, use original
        console.error("Image compression failed:", e);
      }
    }
    
    // Add the new image
    savedImages[key] = {
      dataUrl: compressedDataUrl,
      metadata,
    }
    
    // Calculate total size after adding new image
    const serializedData = JSON.stringify(savedImages);
    const dataSize = new Blob([serializedData]).size;
    
    // Set a more conservative storage limit (3MB to be even safer)
    const MAX_STORAGE_SIZE = 3 * 1024 * 1024;
    
    if (dataSize > MAX_STORAGE_SIZE) {
      // If we're still over quota after removing old images, 
      // aggressively remove images until we're under the limit
      const sortedKeys = Object.keys(savedImages)
        .filter(k => k !== key) // Don't remove the new image
        .sort((a, b) => savedImages[a].metadata.timestamp - savedImages[b].metadata.timestamp);
      
      while (sortedKeys.length > 0 && JSON.stringify(savedImages).length > MAX_STORAGE_SIZE) {
        const oldestKey = sortedKeys.shift();
        if (oldestKey) {
          delete savedImages[oldestKey];
        }
      }
      
      // If we've removed all other images and still over quota
      if (JSON.stringify(savedImages).length > MAX_STORAGE_SIZE) {
        throw new Error("The image is too large to store even after removing all other images. Please download it instead.");
      }
    }
    
    // Try to save the potentially reduced set of images
    localStorage.setItem("steganography-images", JSON.stringify(savedImages));
  } catch (error) {
    console.error("Error saving image to localStorage:", error);
    throw error; // Re-throw so the UI can show appropriate message
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

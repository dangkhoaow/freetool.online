/**
 * AES Encryption Service
 * 
 * This service provides functions for encrypting and decrypting data using AES-256-CTR
 */
import CryptoJS from 'crypto-js';

class AesEncryption {
  private secretKey: string = '';
  // Used for version tracking of encryption
  private readonly VERSION = 'v1:';

  constructor(secretKey?: string) {
    if (secretKey) {
      this.secretKey = secretKey;
    }
  }

  setSecretKey(key: string): void {
    // Store the exact key as provided
    this.secretKey = key;
  }

  encrypt(text: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is not set');
    }
    
    try {
      // Add version marker to support future encryption versions
      const versionedText = this.VERSION + text;
      
      // Use a consistent salt and IV to make encryption more robust
      const salt = CryptoJS.lib.WordArray.random(128/8);
      
      // Store the salt with the encrypted text for decryption
      const saltHex = salt.toString();
      
      // Generate key and IV from the password and salt
      const keyAndIV = CryptoJS.PBKDF2(this.secretKey, salt, {
        keySize: 256/32 + 128/32, // Key size + IV size
        iterations: 1000
      });
      
      const key = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(0, 256/32), 256/8);
      const iv = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(256/32), 128/8);
      
      // Encrypt the text
      const encrypted = CryptoJS.AES.encrypt(versionedText, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
      });
      
      // Combine salt, IV, and ciphertext for storage
      const result = saltHex + encrypted.toString();
      return result;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt the text');
    }
  }

  decrypt(encryptedText: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is not set');
    }
    
    try {
      // Check if the input is valid
      if (!encryptedText || encryptedText.length < 32) {
        throw new Error('Invalid encrypted text format');
      }
      
      // Try the newer format first
      try {
        // Extract salt (first 32 chars, 128 bits)
        const salt = CryptoJS.enc.Hex.parse(encryptedText.substring(0, 32));
        // Get the ciphertext (the rest of the string)
        const ciphertext = encryptedText.substring(32);
        
        // Generate key and IV from the exact password and salt
        const keyAndIV = CryptoJS.PBKDF2(this.secretKey, salt, {
          keySize: 256/32 + 128/32, // Key size + IV size
          iterations: 1000
        });
        
        const key = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(0, 256/32), 256/8);
        const iv = CryptoJS.lib.WordArray.create(keyAndIV.words.slice(256/32), 128/8);
        
        // Decrypt
        const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
          iv: iv,
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC
        });
        
        // Convert to string and validate
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        
        // Validate result - often when the key is wrong, we get an empty string
        if (!result || result.length === 0) {
          throw new Error('No result from first decryption method');
        }
        
        // Check for version marker and remove it
        if (result.startsWith(this.VERSION)) {
          return result.substring(this.VERSION.length);
        }
        
        // If no version marker but still valid text
        return result;
      } catch (newFormatError) {
        console.log("First decryption method failed, trying legacy method");
        
        // Legacy format fallback - try direct decryption
        try {
          // Try direct decryption (old format)
          const legacyDecrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
          const legacyResult = legacyDecrypted.toString(CryptoJS.enc.Utf8);
          
          if (!legacyResult || legacyResult.length === 0) {
            throw new Error('Legacy decryption failed - likely wrong key');
          }
          
          return legacyResult;
        } catch (legacyError) {
          // Both methods failed, throw a clearer error
          throw new Error('Decryption failed - incorrect key');
        }
      }
    } catch (error) {
      console.error('Decryption error:', error);
      if (error instanceof Error) {
        if (!error.message.includes('Decryption failed')) {
          throw new Error('Decryption failed - incorrect key');
        }
        throw error;
      }
      throw new Error('Decryption failed - incorrect key');
    }
  }
}

export default AesEncryption; 
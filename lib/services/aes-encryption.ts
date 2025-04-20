/**
 * AES Encryption Service
 * 
 * This service provides functions for encrypting and decrypting data using AES-256-CTR
 */
import CryptoJS from 'crypto-js';

class AesEncryption {
  private secretKey: string = '';

  constructor(secretKey?: string) {
    if (secretKey) {
      this.secretKey = secretKey;
    }
  }

  setSecretKey(key: string): void {
    this.secretKey = key;
  }

  encrypt(text: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is not set');
    }
    
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(encryptedText: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is not set');
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export default AesEncryption; 
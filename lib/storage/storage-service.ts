"use client";

/**
 * StorageService for browser client-side storage
 * Browser-compatible version of the backend StorageService
 * Uses localStorage for persistence with optional encryption
 */
export class StorageService {
  private prefix: string;
  private encryptionKey: string | null = null;

  /**
   * Create a new StorageService instance
   * @param namespace Namespace to prefix all keys with (prevents conflicts)
   */
  constructor(namespace: string = 'freetool') {
    this.prefix = `${namespace}_`;
  }

  /**
   * Set encryption key for sensitive data
   * @param key Encryption key to use
   */
  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  /**
   * Save data to storage
   * @param key Storage key
   * @param data Data to store (will be JSON stringified)
   * @param encrypt Whether to encrypt the data
   */
  save<T>(key: string, data: T, encrypt: boolean = false): void {
    try {
      const prefixedKey = this.prefix + key;
      const jsonData = JSON.stringify(data);
      const valueToStore = encrypt && this.encryptionKey 
        ? this.encrypt(jsonData, this.encryptionKey)
        : jsonData;
      
      localStorage.setItem(prefixedKey, valueToStore);
    } catch (err) {
      console.error('Error saving to storage:', err);
    }
  }

  /**
   * Load data from storage
   * @param key Storage key
   * @param defaultValue Default value if key doesn't exist
   * @param encrypted Whether the data is encrypted
   */
  load<T>(key: string, defaultValue: T, encrypted: boolean = false): T {
    try {
      const prefixedKey = this.prefix + key;
      const storedValue = localStorage.getItem(prefixedKey);
      
      if (!storedValue) return defaultValue;
      
      const jsonData = encrypted && this.encryptionKey
        ? this.decrypt(storedValue, this.encryptionKey)
        : storedValue;
      
      return JSON.parse(jsonData) as T;
    } catch (err) {
      console.error('Error loading from storage:', err);
      return defaultValue;
    }
  }

  /**
   * Check if a key exists in storage
   * @param key Storage key
   */
  exists(key: string): boolean {
    const prefixedKey = this.prefix + key;
    return localStorage.getItem(prefixedKey) !== null;
  }

  /**
   * Remove data from storage
   * @param key Storage key
   */
  remove(key: string): void {
    const prefixedKey = this.prefix + key;
    localStorage.removeItem(prefixedKey);
  }

  /**
   * Clear all data with this namespace prefix
   */
  clear(): void {
    const keysToRemove = [];
    
    // Find all keys with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * List all keys in this namespace
   */
  keys(): string[] {
    const result = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        result.push(key.slice(this.prefix.length));
      }
    }
    
    return result;
  }

  /**
   * Basic encryption using AES if available, or simple XOR otherwise
   * For more serious encryption, consider using the Web Crypto API
   */
  private encrypt(text: string, key: string): string {
    // Simple XOR encryption for demo purposes
    // In a real app, use Web Crypto API for proper encryption
    const result = [];
    for (let i = 0; i < text.length; i++) {
      result.push(String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length)));
    }
    return btoa(result.join(''));
  }

  /**
   * Decrypt data encrypted with the encrypt method
   */
  private decrypt(encryptedText: string, key: string): string {
    // Simple XOR decryption
    const encryptedBytes = atob(encryptedText);
    const result = [];
    for (let i = 0; i < encryptedBytes.length; i++) {
      result.push(String.fromCharCode(encryptedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length)));
    }
    return result.join('');
  }
}

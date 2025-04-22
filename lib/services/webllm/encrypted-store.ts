"use client";

import { useState, useEffect } from 'react';
import { ModelCacheInfo } from './types';

/**
 * Encrypted local storage for WebLLM chat history and model information
 * Uses the Web Crypto API for local encryption
 */

// Constants
const ENCRYPTION_KEY_NAME = 'webllm-encryption-key';
const CHAT_HISTORY_KEY = 'webllm-chat-history';
const MODEL_CACHE_INFO_KEY = 'webllm-model-cache-info';
const IV_LENGTH = 12; // 12 bytes for AES-GCM

// Helper functions for encryption/decryption
async function generateEncryptionKey(): Promise<CryptoKey> {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export the key to store it
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const exportedKeyBuffer = new Uint8Array(exportedKey);
  
  // Store the key in localStorage as base64
  localStorage.setItem(ENCRYPTION_KEY_NAME, arrayBufferToBase64(exportedKeyBuffer));
  
  return key;
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (storedKey) {
    // Convert the stored base64 key back to a CryptoKey
    const keyBuffer = base64ToArrayBuffer(storedKey);
    return window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } else {
    // Generate a new key if one doesn't exist
    return generateEncryptionKey();
  }
}

async function encryptData(data: any): Promise<string> {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const dataString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(dataString);
  
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );
  
  // Combine the IV and encrypted data
  const encryptedArray = new Uint8Array(iv.byteLength + encryptedData.byteLength);
  encryptedArray.set(iv, 0);
  encryptedArray.set(new Uint8Array(encryptedData), iv.byteLength);
  
  // Convert to base64 for storage
  return arrayBufferToBase64(encryptedArray);
}

async function decryptData(encryptedBase64: string): Promise<any> {
  try {
    const key = await getEncryptionKey();
    const encryptedArray = base64ToArrayBuffer(encryptedBase64);
    
    // Extract the IV and encrypted data
    const iv = encryptedArray.slice(0, IV_LENGTH);
    const encryptedData = encryptedArray.slice(IV_LENGTH);
    
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
    
    const decodedData = new TextDecoder().decode(decryptedData);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Utility functions for base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Hook for using encrypted local storage
export function useEncryptedStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const decryptedData = await decryptData(storedData);
          if (decryptedData !== null) {
            setValue(decryptedData);
          }
        }
      } catch (error) {
        console.error(`Error loading encrypted data for key ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Save data on updates
  const updateValue = async (newValue: T) => {
    try {
      setValue(newValue);
      const encryptedData = await encryptData(newValue);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error(`Error saving encrypted data for key ${key}:`, error);
    }
  };

  return { value, updateValue, isLoading };
}

// Specific hooks for WebLLM data
export function useEncryptedChatHistory<T>(initialValue: T) {
  return useEncryptedStore<T>(CHAT_HISTORY_KEY, initialValue);
}

export function useModelCacheInfo() {
  return useEncryptedStore<ModelCacheInfo[]>(MODEL_CACHE_INFO_KEY, []);
} 
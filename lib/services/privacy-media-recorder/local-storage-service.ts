import { RecordedMedia } from './media-recorder-service';

const DB_NAME = 'privacy-media-recorder-db';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';

export class LocalStorageService {
  private db: IDBDatabase | null = null;
  
  /**
   * Initialize the IndexedDB database
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB database'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for recordings if it doesn't exist
        if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
          const store = db.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  
  /**
   * Save a recording to IndexedDB
   */
  public async saveRecording(recording: RecordedMedia): Promise<string> {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(RECORDINGS_STORE, 'readwrite');
      const store = transaction.objectStore(RECORDINGS_STORE);
      
      const request = store.add(recording);
      
      request.onerror = () => {
        reject(new Error('Failed to save recording'));
      };
      
      request.onsuccess = () => {
        resolve(recording.id);
      };
    });
  }
  
  /**
   * Get all recordings from IndexedDB
   */
  public async getAllRecordings(): Promise<RecordedMedia[]> {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(RECORDINGS_STORE, 'readonly');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const index = store.index('timestamp');
      
      // Get all recordings sorted by timestamp (newest first)
      const request = index.openCursor(null, 'prev');
      const recordings: RecordedMedia[] = [];
      
      request.onerror = () => {
        reject(new Error('Failed to get recordings'));
      };
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          recordings.push(cursor.value);
          cursor.continue();
        } else {
          resolve(recordings);
        }
      };
    });
  }
  
  /**
   * Get a recording by ID from IndexedDB
   */
  public async getRecordingById(id: string): Promise<RecordedMedia | null> {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(RECORDINGS_STORE, 'readonly');
      const store = transaction.objectStore(RECORDINGS_STORE);
      
      const request = store.get(id);
      
      request.onerror = () => {
        reject(new Error('Failed to get recording'));
      };
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }
  
  /**
   * Delete a recording by ID from IndexedDB
   */
  public async deleteRecording(id: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(RECORDINGS_STORE, 'readwrite');
      const store = transaction.objectStore(RECORDINGS_STORE);
      
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error('Failed to delete recording'));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  /**
   * Clear all recordings from IndexedDB
   */
  public async clearAllRecordings(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      const transaction = this.db.transaction(RECORDINGS_STORE, 'readwrite');
      const store = transaction.objectStore(RECORDINGS_STORE);
      
      const request = store.clear();
      
      request.onerror = () => {
        reject(new Error('Failed to clear recordings'));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
  
  /**
   * Close the IndexedDB database
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

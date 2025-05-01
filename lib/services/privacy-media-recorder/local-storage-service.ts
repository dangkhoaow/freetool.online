import { RecordedMedia } from './media-recorder-service';

// Cache names
const CACHE_NAME = 'privacy-media-recorder-cache';
const METADATA_CACHE_NAME = 'privacy-media-recorder-metadata-cache';

export class LocalStorageService {
  private initialized: boolean = false;
  
  /**
   * Initialize the cache storage
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      // Open both caches to ensure they exist
      await caches.open(CACHE_NAME);
      await caches.open(METADATA_CACHE_NAME);
      this.initialized = true;
      console.log('[STORAGE] Cache storage initialized');
    } catch (error) {
      console.error('[STORAGE] Failed to initialize cache storage:', error);
      throw new Error('Failed to initialize cache storage');
    }
  }
  
  /**
   * Save a recording to Cache Storage
   * - Blob data goes to CACHE_NAME
   * - Metadata goes to METADATA_CACHE_NAME
   */
  public async saveRecording(recording: RecordedMedia): Promise<string> {
    await this.initialize();
    
    try {
      // Log the size of the blob we're about to save
      console.log('[STORAGE] Saving to Cache Storage:', {
        name: recording.name,
        size: recording.blob?.size,
        type: recording.type,
        duration: recording.duration,
        hasChunks: !!recording.chunks,
        chunksCount: recording.chunks?.length || 0,
        totalChunksSize: recording.chunks ? this.getTotalChunksSize(recording.chunks) : 0
      });
      
      // Additional logging for debugging
      console.log('[STORAGE] Recording blob details:', {
        constructor: recording.blob.constructor.name,
        isBlob: recording.blob instanceof Blob,
        sizeMB: recording.blob.size / (1024 * 1024),
        sizeBytes: recording.blob.size
      });
      
      // 1. Store the main blob in the cache
      const blobCache = await caches.open(CACHE_NAME);
      
      // Create a clone of the blob to ensure we're working with a fresh copy
      const blobCopy = new Blob([await recording.blob.arrayBuffer()], { type: recording.type });
      
      console.log('[STORAGE] Created blob copy with size:', blobCopy.size);
      
      const blobResponse = new Response(blobCopy, {
        headers: {
          'Content-Type': recording.type,
          'Content-Length': blobCopy.size.toString()
        }
      });
      
      // Create a unique URL for this recording's blob
      const blobUrl = `/recordings/${recording.id}/blob`;
      await blobCache.put(blobUrl, blobResponse);
      
      // Verify the saved blob size
      const savedResponse = await blobCache.match(blobUrl);
      if (savedResponse) {
        const savedBlob = await savedResponse.blob();
        console.log('[STORAGE] Verified saved blob size:', savedBlob.size);
      }
      
      // 2. Store each chunk individually if present
      const chunkUrls: string[] = [];
      if (recording.chunks && recording.chunks.length > 0) {
        console.log(`[STORAGE] Storing ${recording.chunks.length} individual chunks...`);
        
        for (let i = 0; i < recording.chunks.length; i++) {
          const chunk = recording.chunks[i];
          const chunkUrl = `/recordings/${recording.id}/chunks/${i}`;
          
          const chunkResponse = new Response(chunk, {
            headers: {
              'Content-Type': recording.type,
              'Content-Length': chunk.size.toString()
            }
          });
          
          await blobCache.put(chunkUrl, chunkResponse);
          chunkUrls.push(chunkUrl);
          
          console.log(`[STORAGE] Saved chunk ${i}:`, chunk.size);
        }
        
        console.log(`[STORAGE] Successfully stored ${chunkUrls.length} chunks`);
      }
      
      // 3. Store the metadata
      const metadataCache = await caches.open(METADATA_CACHE_NAME);
      const metadata = {
        id: recording.id,
        type: recording.type,
        name: recording.name,
        size: recording.size,
        duration: recording.duration,
        timestamp: recording.timestamp,
        blobUrl,
        chunkUrls,
        hasChunks: chunkUrls.length > 0,
        chunksCount: chunkUrls.length,
        originalSize: recording.blob.size,
        totalChunksSize: recording.chunks ? this.getTotalChunksSize(recording.chunks) : 0
      };
      
      const metadataResponse = new Response(JSON.stringify(metadata), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Store metadata with a separate URL
      const metadataUrl = `/recordings/${recording.id}/metadata`;
      await metadataCache.put(metadataUrl, metadataResponse);
      
      console.log('[STORAGE] Recording saved successfully:', { 
        id: recording.id, 
        size: recording.size,
        originalBlobSize: recording.blob.size,
        totalChunksSize: metadata.totalChunksSize
      });
      return recording.id;
    } catch (error) {
      console.error('[STORAGE] Failed to save recording:', error);
      throw new Error('Failed to save recording');
    }
  }
  
  /**
   * Get all recordings from Cache Storage
   */
  public async getAllRecordings(): Promise<RecordedMedia[]> {
    await this.initialize();
    
    try {
      // 1. Get the metadata cache
      const metadataCache = await caches.open(METADATA_CACHE_NAME);
      const keys = await metadataCache.keys();
      const recordings: RecordedMedia[] = [];
      
      // Process each metadata entry
      for (const key of keys) {
        if (key.url.includes('/metadata')) {
          const response = await metadataCache.match(key);
          if (response) {
            // Parse the metadata
            const metadata = await response.json();
            
            // Get the corresponding blob from the main cache
            const blobCache = await caches.open(CACHE_NAME);
            const blobResponse = await blobCache.match(metadata.blobUrl);
            
            if (blobResponse) {
              // Get the blob from the response
              const blob = await blobResponse.blob();
              
              // Log the retrieved recording size
              console.log('[STORAGE] Retrieved from Cache Storage:', {
                name: metadata.name,
                size: blob.size,
                type: metadata.type,
                originalSize: metadata.originalSize,
                hasChunks: metadata.hasChunks,
                chunksCount: metadata.chunksCount,
                totalChunksSize: metadata.totalChunksSize,
                sizeDifferencePercent: metadata.originalSize ? 
                  Math.round((metadata.originalSize - blob.size) / metadata.originalSize * 100) : 'unknown'
              });
              
              // Load individual chunks if they exist
              let chunks: Blob[] | undefined = undefined;
              if (metadata.hasChunks && metadata.chunkUrls && metadata.chunkUrls.length > 0) {
                chunks = [];
                console.log(`[STORAGE] Loading ${metadata.chunkUrls.length} chunks...`);
                
                // Load each chunk
                for (const chunkUrl of metadata.chunkUrls) {
                  const chunkResponse = await blobCache.match(chunkUrl);
                  if (chunkResponse) {
                    const chunkBlob = await chunkResponse.blob();
                    chunks.push(chunkBlob);
                    console.log(`[STORAGE] Loaded chunk:`, chunkBlob.size);
                  }
                }
                
                console.log(`[STORAGE] Loaded ${chunks.length} chunks with total size:`, 
                  chunks.reduce((size, chunk) => size + chunk.size, 0));
                
                // If we have chunks, reconstruct blob from them for better quality
                if (chunks.length > 0) {
                  const reconstructedBlob = new Blob(chunks, { type: metadata.type });
                  console.log(`[STORAGE] Reconstructed blob from chunks:`, {
                    originalSize: metadata.originalSize,
                    storedBlobSize: blob.size,
                    reconstructedSize: reconstructedBlob.size
                  });
                  
                  // Use the reconstructed blob if it's larger (better quality)
                  if (reconstructedBlob.size > blob.size) {
                    console.log(`[STORAGE] Using reconstructed blob as it's larger`);
                    const betterBlob = reconstructedBlob;
                    
                    // Create a RecordedMedia object with the blob and metadata
                    const recording: RecordedMedia = {
                      id: metadata.id,
                      blob: betterBlob,
                      url: URL.createObjectURL(betterBlob),  // Create a fresh blob URL
                      type: metadata.type,
                      name: metadata.name,
                      size: betterBlob.size, // Use the actual blob size, not the stored metadata size
                      duration: metadata.duration,
                      timestamp: metadata.timestamp,
                      chunks: chunks // Include the chunks if available
                    };
                    
                    recordings.push(recording);
                    continue; // Skip the standard blob recording creation
                  }
                }
              }
              
              // Create a RecordedMedia object with the blob and metadata
              const recording: RecordedMedia = {
                id: metadata.id,
                blob: blob,
                url: URL.createObjectURL(blob),  // Create a fresh blob URL
                type: metadata.type,
                name: metadata.name,
                size: blob.size, // Use the actual blob size, not the stored metadata size
                duration: metadata.duration,
                timestamp: metadata.timestamp,
                chunks: chunks // Include the chunks if available
              };
              
              recordings.push(recording);
            }
          }
        }
      }
      
      // Sort by timestamp (newest first)
      return recordings.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('[STORAGE] Failed to get recordings:', error);
      throw new Error('Failed to get recordings');
    }
  }
  
  /**
   * Get a recording by ID from Cache Storage
   */
  public async getRecordingById(id: string): Promise<RecordedMedia | null> {
    await this.initialize();
    
    try {
      // Get the metadata
      const metadataCache = await caches.open(METADATA_CACHE_NAME);
      const metadataUrl = `/recordings/${id}/metadata`;
      const metadataResponse = await metadataCache.match(metadataUrl);
      
      if (!metadataResponse) {
        return null;
      }
      
      const metadata = await metadataResponse.json();
      
      // Get the blob
      const blobCache = await caches.open(CACHE_NAME);
      const blobResponse = await blobCache.match(metadata.blobUrl);
      
      if (!blobResponse) {
        return null;
      }
      
      const blob = await blobResponse.blob();
      
      // Log the retrieved recording
      console.log('[STORAGE] Retrieved recording by ID:', {
        id,
        size: blob.size,
        type: metadata.type,
        originalSize: metadata.originalSize,
        hasChunks: metadata.hasChunks,
        chunksCount: metadata.chunksCount,
        totalChunksSize: metadata.totalChunksSize,
        sizeDifferencePercent: metadata.originalSize ? 
          Math.round((metadata.originalSize - blob.size) / metadata.originalSize * 100) : 'unknown'
      });
      
      // Load individual chunks if they exist
      let chunks: Blob[] | undefined = undefined;
      if (metadata.hasChunks && metadata.chunkUrls && metadata.chunkUrls.length > 0) {
        chunks = [];
        console.log(`[STORAGE] Loading ${metadata.chunkUrls.length} chunks...`);
        
        // Load each chunk
        for (const chunkUrl of metadata.chunkUrls) {
          const chunkResponse = await blobCache.match(chunkUrl);
          if (chunkResponse) {
            const chunkBlob = await chunkResponse.blob();
            chunks.push(chunkBlob);
            console.log(`[STORAGE] Loaded chunk:`, chunkBlob.size);
          }
        }
        
        console.log(`[STORAGE] Loaded ${chunks.length} chunks with total size:`, 
          chunks.reduce((size, chunk) => size + chunk.size, 0));
        
        // If we have chunks, reconstruct blob from them for better quality
        if (chunks.length > 0) {
          const reconstructedBlob = new Blob(chunks, { type: metadata.type });
          console.log(`[STORAGE] Reconstructed blob from chunks:`, {
            originalSize: metadata.originalSize,
            storedBlobSize: blob.size,
            reconstructedSize: reconstructedBlob.size
          });
          
          // Use the reconstructed blob if it's larger (better quality)
          if (reconstructedBlob.size > blob.size) {
            console.log(`[STORAGE] Using reconstructed blob as it's larger`);
            const betterBlob = reconstructedBlob;
            return {
              id: metadata.id,
              blob: betterBlob,
              url: URL.createObjectURL(betterBlob),  // Create a fresh blob URL
              type: metadata.type,
              name: metadata.name,
              size: betterBlob.size, // Use the actual blob size, not the stored metadata size
              duration: metadata.duration,
              timestamp: metadata.timestamp,
              chunks: chunks // Include the chunks if available
            };
          }
        }
      }
      
      // Create a RecordedMedia object
      const recording: RecordedMedia = {
        id: metadata.id,
        blob: blob,
        url: URL.createObjectURL(blob),  // Create a fresh blob URL
        type: metadata.type,
        name: metadata.name,
        size: blob.size, // Use the actual blob size, not the stored metadata size
        duration: metadata.duration,
        timestamp: metadata.timestamp,
        chunks: chunks // Include the chunks if available
      };
      
      return recording;
    } catch (error) {
      console.error('[STORAGE] Failed to get recording by ID:', error);
      return null;
    }
  }
  
  /**
   * Delete a recording from Cache Storage
   */
  public async deleteRecording(id: string): Promise<void> {
    await this.initialize();
    
    try {
      // Delete from both caches
      const blobCache = await caches.open(CACHE_NAME);
      const metadataCache = await caches.open(METADATA_CACHE_NAME);
      
      const blobUrl = `/recordings/${id}/blob`;
      const metadataUrl = `/recordings/${id}/metadata`;
      
      await blobCache.delete(blobUrl);
      await metadataCache.delete(metadataUrl);
      
      console.log('[STORAGE] Recording deleted:', id);
    } catch (error) {
      console.error('[STORAGE] Failed to delete recording:', error);
      throw new Error('Failed to delete recording');
    }
  }
  
  /**
   * Clear all recordings from Cache Storage
   */
  public async clearAllRecordings(): Promise<void> {
    try {
      // Delete and recreate both caches
      await caches.delete(CACHE_NAME);
      await caches.delete(METADATA_CACHE_NAME);
      
      // Re-initialize
      await this.initialize();
      
      console.log('[STORAGE] All recordings cleared');
    } catch (error) {
      console.error('[STORAGE] Failed to clear recordings:', error);
      throw new Error('Failed to clear recordings');
    }
  }
  
  private getTotalChunksSize(chunks: Blob[]): number {
    return chunks.reduce((total, chunk) => total + chunk.size, 0);
  }
}

"use client"

import { useState, useEffect } from "react"

interface IndexedDBHook {
  getAll: <T>(storeName: string) => Promise<T[]>
  getById: <T>(storeName: string, id: string) => Promise<T | undefined>
  add: <T>(storeName: string, item: T) => Promise<string>
  update: <T>(storeName: string, item: T) => Promise<void>
  remove: (storeName: string, id: string) => Promise<void>
  error: Error | null
  isReady: boolean
}

// Define database name and version
const DB_NAME = "ClientSiteBuilderDB"
const DB_VERSION = 1

export default function useIndexedDB(): IndexedDBHook {
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize IndexedDB
  useEffect(() => {
    let isMounted = true;
    
    const openDB = () => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        if (isMounted) setError(new Error("IndexedDB not supported in this environment"))
        return
      }

      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = (event) => {
          const target = event.target as IDBRequest
          if (isMounted) setError(new Error(`Database error: ${target.error?.message || "Unknown error"}`))
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBRequest).result
          
          // Create object stores with indexes
          if (!db.objectStoreNames.contains("projects")) {
            const projectsStore = db.createObjectStore("projects", { keyPath: "id" })
            projectsStore.createIndex("name", "name", { unique: false })
            projectsStore.createIndex("updatedAt", "updatedAt", { unique: false })
          }
          
          if (!db.objectStoreNames.contains("components")) {
            const componentsStore = db.createObjectStore("components", { keyPath: "id" })
            componentsStore.createIndex("type", "type", { unique: false })
          }
          
          if (!db.objectStoreNames.contains("assets")) {
            const assetsStore = db.createObjectStore("assets", { keyPath: "id" })
            assetsStore.createIndex("type", "type", { unique: false })
            assetsStore.createIndex("projectId", "projectId", { unique: false })
          }
        }

        request.onsuccess = (event) => {
          if (isMounted) {
            setDb((event.target as IDBRequest).result)
            setIsReady(true)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error initializing IndexedDB:", err)
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      }
    }

    openDB()

    // Clean up function
    return () => {
      isMounted = false;
      if (db) {
        db.close()
      }
    }
  }, [])

  // Get all items from a store
  const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !db) {
        reject(new Error("Database not initialized"))
        return
      }

      try {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // Get item by ID
  const getById = <T>(storeName: string, id: string): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !db) {
        reject(new Error("Database not initialized"))
        return
      }

      try {
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const request = store.get(id)

        request.onsuccess = () => {
          resolve(request.result)
        }

        request.onerror = () => {
          reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // Add a new item
  const add = <T>(storeName: string, item: T): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !db) {
        reject(new Error("Database not initialized"))
        return
      }

      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.add(item)

        request.onsuccess = () => {
          resolve(request.result as string)
        }

        request.onerror = () => {
          reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // Update an existing item
  const update = <T>(storeName: string, item: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !db) {
        reject(new Error("Database not initialized"))
        return
      }

      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.put(item)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  // Remove an item
  const remove = (storeName: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!isReady || !db) {
        reject(new Error("Database not initialized"))
        return
      }

      try {
        const transaction = db.transaction(storeName, "readwrite")
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onsuccess = () => {
          resolve()
        }

        request.onerror = () => {
          reject(request.error)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  return {
    getAll,
    getById,
    add,
    update,
    remove,
    error,
    isReady
  }
}

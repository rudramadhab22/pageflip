import { IDB } from '../lib/constants'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB.name, IDB.version)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IDB.store)) {
        db.createObjectStore(IDB.store, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'))
  })
}

export async function savePdfBlob({ id, blob, name, type }) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB.store, 'readwrite')
    tx.objectStore(IDB.store).put({
      id,
      blob,
      name,
      type: type || 'application/pdf',
      savedAt: Date.now(),
    })
    tx.oncomplete = () => {
      db.close()
      resolve(id)
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error || new Error('Failed to save PDF'))
    }
  })
}

export async function getPdfRecord(id) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB.store, 'readonly')
    const request = tx.objectStore(IDB.store).get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error || new Error('Failed to read PDF'))
    tx.oncomplete = () => db.close()
    tx.onerror = () => {
      db.close()
      reject(tx.error || new Error('Failed to read PDF'))
    }
  })
}

export async function deletePdfBlob(id) {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB.store, 'readwrite')
    tx.objectStore(IDB.store).delete(id)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error || new Error('Failed to delete PDF'))
    }
  })
}

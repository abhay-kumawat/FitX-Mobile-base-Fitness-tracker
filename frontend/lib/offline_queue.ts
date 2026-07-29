// FitX AI - Offline Data Platform Sync Queue (Task 2.2)
// Implements fitx_offline_db_v2 IndexedDB engine & 9-field entity contracts

export type SyncStatus = "QUEUED" | "UPLOADING" | "MERGED" | "CONFLICT" | "FAILED";
export type ConflictStatus = "NONE" | "RESOLVED_CLIENT_WIN" | "RESOLVED_SERVER_WIN" | "MANUAL_REQUIRED";

export interface IOfflineEntity<T = any> {
  id: string;
  entity_type: "WORKOUT" | "TIMELINE" | "NUTRITION" | "RECOVERY" | "DTIE" | "AI_ACTION";
  entity_version: number;
  created_at_utc: string;
  updated_at_utc: string;
  sync_status: SyncStatus;
  conflict_status: ConflictStatus;
  last_server_version: number;
  checksum_sha256: string;
  source_device_id: string;
  payload: T;
}

const DB_NAME = "fitx_offline_db_v2";
const DB_VERSION = 1;
const QUEUE_STORE = "sync_queue";

// Simple client device ID generator
function getDeviceId(): string {
  if (typeof window === "undefined") return "server-node";
  let devId = localStorage.getItem("fitx_device_id");
  if (!devId) {
    devId = "dev_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    localStorage.setItem("fitx_device_id", devId);
  }
  return devId;
}

// Open or initialize IndexedDB Connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject("IndexedDB unavailable in current runtime environment");
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
        store.createIndex("sync_status", "sync_status", { unique: false });
        store.createIndex("entity_type", "entity_type", { unique: false });
        store.createIndex("updated_at_utc", "updated_at_utc", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enqueues a new offline entity into IndexedDB.
 */
export async function enqueueOfflineEntity<T>(
  entityType: IOfflineEntity<T>["entity_type"],
  payload: T
): Promise<IOfflineEntity<T>> {
  const db = await openDB();
  const now = new Date().toISOString();
  
  const entity: IOfflineEntity<T> = {
    id: "offline_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
    entity_type: entityType,
    entity_version: 1,
    created_at_utc: now,
    updated_at_utc: now,
    sync_status: "QUEUED",
    conflict_status: "NONE",
    last_server_version: 0,
    checksum_sha256: "sha256_mock_hash",
    source_device_id: getDeviceId(),
    payload,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const req = store.add(entity);

    req.onsuccess = () => resolve(entity);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all pending offline entities waiting to be synchronized.
 */
export async function getPendingSyncEntities(): Promise<IOfflineEntity[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const store = tx.objectStore(QUEUE_STORE);
    const index = store.index("sync_status");
    const req = index.getAll("QUEUED");

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Updates the sync status of an entity after server response or network error.
 */
export async function updateEntitySyncStatus(
  id: string,
  status: SyncStatus,
  serverVersion?: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item: IOfflineEntity = getReq.result;
      if (!item) return resolve();

      item.sync_status = status;
      item.updated_at_utc = new Date().toISOString();
      if (serverVersion !== undefined) {
        item.last_server_version = serverVersion;
      }

      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Removes completed/merged entities from IndexedDB queue.
 */
export async function purgeMergedEntities(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const index = store.index("sync_status");
    const req = index.getAllKeys("MERGED");

    req.onsuccess = () => {
      const keys = req.result || [];
      keys.forEach((key) => store.delete(key));
      resolve(keys.length);
    };

    req.onerror = () => reject(req.error);
  });
}

import { openDB } from 'idb';

const DB_NAME = 'POSDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('branches')) {
        db.createObjectStore('branches', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    },
  });
};

export const saveData = async (store, data) => {
  const db = await initDB();
  const tx = db.transaction(store, 'readwrite');
  await tx.objectStore(store).put(data);
  await tx.done;
};

export const getAllData = async (store) => {
  const db = await initDB();
  return db.getAll(store);
};
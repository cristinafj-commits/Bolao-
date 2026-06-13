import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

// Configuration provided in the user's simplified code snippet
const firebaseConfig = {
  apiKey: "AIzaSyCfrX0U_2dGPK6qNsBQshfJ0S_hq39pmgU",
  authDomain: "bolao-da-copa-ff854.firebaseapp.com",
  projectId: "bolao-da-copa-ff854",
  storageBucket: "bolao-da-copa-ff854.firebasestorage.app",
  messagingSenderId: "730063016595",
  appId: "1:730063016595:web:a300394ce11bff5e0bb366",
  measurementId: "G-CH72NPPMPQ",
  databaseURL: "https://bolao-da-copa-ff854-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Simple document reference adapter
export function doc(dbInstance: any, path: string, subPath?: string) {
  const fullPath = subPath ? `${path}/${subPath}` : path;
  return { type: 'document', path: fullPath };
}

// Simple collection reference adapter
export function collection(dbInstance: any, path: string) {
  return { type: 'collection', path };
}

// Helper to clean undefined values recursively before saving to Realtime Database
function sanitizeData(val: any): any {
  if (val === undefined) {
    return null;
  }
  if (val === null) {
    return null;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeData);
  }
  if (typeof val === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = sanitizeData(val[key]);
    }
    return cleaned;
  }
  return val;
}

// Simple setDoc adapter supporting { merge: true } options of Firestore
export async function setDoc(docObj: any, data: any, options?: { merge?: boolean }) {
  const sanitized = sanitizeData(data);
  if (options?.merge) {
    const snapshot = await get(ref(db, docObj.path));
    const existing = snapshot.val() || {};
    const merged = { ...existing, ...sanitized };
    await set(ref(db, docObj.path), sanitizeData(merged));
  } else {
    await set(ref(db, docObj.path), sanitized);
  }
}

// Simple deleteDoc adapter
export async function deleteDoc(docObj: any) {
  await set(ref(db, docObj.path), null);
}

// Simple getDoc adapter
export async function getDoc(docObj: any) {
  const snapshot = await get(ref(db, docObj.path));
  return {
    exists: () => snapshot.exists(),
    data: () => snapshot.val()
  };
}

// Simple getDocs adapter (collection-level read)
export async function getDocs(collectionObj: any) {
  const snapshot = await get(ref(db, collectionObj.path));
  const data = snapshot.val() || {};
  const docs: any[] = [];
  Object.entries(data).forEach(([key, val]: [string, any]) => {
    docs.push({
      id: key,
      data: () => val,
      exists: () => true
    });
  });
  return {
    forEach: (childCallback: any) => docs.forEach(childCallback)
  };
}

// Simple onSnapshot adapter
export function onSnapshot(target: any, callback: any, errorCallback?: any) {
  if (target.type === 'collection') {
    return onValue(ref(db, target.path), (snapshot) => {
      const data = snapshot.val() || {};
      const docs: any[] = [];
      Object.entries(data).forEach(([key, val]: [string, any]) => {
        docs.push({
          id: key,
          data: () => val,
          exists: () => true
        });
      });
      callback({
        forEach: (childCallback: any) => docs.forEach(childCallback)
      });
    }, errorCallback);
  } else {
    return onValue(ref(db, target.path), (snapshot) => {
      callback({
        exists: () => snapshot.exists(),
        data: () => snapshot.val()
      });
    }, errorCallback);
  }
}

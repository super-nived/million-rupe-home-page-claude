import {
  doc as docFn,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limitToLast,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const GOLDEN_DOC = docFn(db, 'config', 'goldenPixel');

// --- Golden pixel config ---

function stripAdmin(data) {
  if (!data) return data;
  const { _adminKey, ...rest } = data;
  return rest;
}

export async function getGoldenConfig() {
  try {
    const snap = await getDoc(GOLDEN_DOC);
    if (snap.exists()) return stripAdmin(snap.data());
  } catch (e) {
    console.error('Failed to load golden config:', e.message);
  }
  return null;
}

export function subscribeToGoldenConfig(callback) {
  return onSnapshot(
    GOLDEN_DOC,
    (snap) => {
      if (snap.exists()) callback(stripAdmin(snap.data()));
      else callback(null);
    },
    (err) => console.error('Golden config subscription error:', err.message)
  );
}

// --- Claim prize (first-come-first-served) ---

export async function claimGoldenPixel({ name, phone, instagram }) {
  const snap = await getDoc(GOLDEN_DOC);
  if (!snap.exists()) throw new Error('No active golden pixel');
  const data = snap.data();
  if (!data.active) throw new Error('Golden pixel is not active');
  if (data.winner) throw new Error('Already claimed by someone else!');

  await updateDoc(GOLDEN_DOC, {
    winner: {
      name,
      phone,
      instagram,
      claimedAt: serverTimestamp(),
    },
    active: false,
  });

  return { ...data, winner: { name, phone, instagram } };
}

// --- Winners history ---

export async function getWinnersHistory() {
  try {
    const q = query(collection(db, 'winners'), orderBy('claimedAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Failed to load winners:', e.message);
    return [];
  }
}

export function subscribeToWinners(callback) {
  const q = query(collection(db, 'winners'), orderBy('claimedAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error('Winners subscription error:', err.message)
  );
}

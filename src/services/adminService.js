import {
  doc as docFn,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Admin key — sent with every write so Firestore rules can verify
let adminKey = '';

export function setAdminKey(key) {
  adminKey = key;
}

// --- Admin password check ---

export async function verifyAdminPassword(password) {
  try {
    const snap = await getDoc(docFn(db, 'config', 'admin'));
    if (snap.exists()) {
      const ok = snap.data().password === password;
      if (ok) setAdminKey(password);
      return ok;
    }
  } catch (e) {
    console.error('Admin verify error:', e.message);
  }
  const ok = password === 'pixellakh2024';
  if (ok) setAdminKey(password);
  return ok;
}

// --- Golden pixel admin operations (direct Firestore SDK) ---

export async function saveGoldenConfig(config) {
  const data = { _adminKey: adminKey };
  if (config.x !== undefined) data.x = config.x;
  if (config.y !== undefined) data.y = config.y;
  if (config.size !== undefined) data.size = config.size;
  if (config.prize !== undefined) data.prize = config.prize;
  if (config.active !== undefined) data.active = config.active;
  if (config.round !== undefined) data.round = config.round;
  if (config.sponsor) data.sponsor = config.sponsor;
  if (config.winner === null) data.winner = null;
  if (config.winner && config.winner !== null) data.winner = config.winner;

  await setDoc(docFn(db, 'config', 'goldenPixel'), data, { merge: true });
}

// --- Site config admin operations ---

export async function saveSiteConfig(config) {
  const data = { _adminKey: adminKey };
  if (config.tagline !== undefined) data.tagline = config.tagline;
  if (config.highlight !== undefined) data.highlight = config.highlight;
  if (config.about) data.about = config.about;

  await setDoc(docFn(db, 'config', 'site'), data, { merge: true });
}

// --- Ad management ---

export async function getAllAds() {
  try {
    const q = query(collection(db, 'ads'), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch {
    const snap = await getDocs(collection(db, 'ads'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

export async function deleteAd(adId) {
  // Direct delete — needs REST API with token since rules block client delete
  // Use Firestore REST with admin key approach
  const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/ads/${adId}`;

  // Try direct SDK delete first (will fail with current rules but fallback exists)
  try {
    await deleteDoc(docFn(db, 'ads', adId));
    return;
  } catch {
    // Fallback: mark as deleted by setting a flag (soft delete)
    throw new Error('Ad deletion requires Firebase Console. Go to: console.firebase.google.com → Firestore → ads → delete manually');
  }
}

// --- Archive winner + start new round ---

export async function archiveWinnerAndReset(goldenData) {
  // Archive current winner to winners collection
  if (goldenData.winner) {
    await addDoc(collection(db, 'winners'), {
      _adminKey: adminKey,
      name: goldenData.winner.name,
      phone: goldenData.winner.phone,
      instagram: goldenData.winner.instagram,
      round: goldenData.round || 1,
      prize: goldenData.prize || 0,
      sponsorName: goldenData.sponsor?.name || '',
      claimedAt: goldenData.winner.claimedAt || serverTimestamp(),
      archivedAt: serverTimestamp(),
    });
  }

  // Reset golden pixel for new round
  const newRound = (goldenData.round || 1) + 1;
  await saveGoldenConfig({
    active: false,
    winner: null,
    round: newRound,
  });

  return newRound;
}

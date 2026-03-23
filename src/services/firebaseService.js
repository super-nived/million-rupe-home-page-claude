import {
  collection,
  doc as docFn,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limitToLast,
  writeBatch,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { SAMPLE_ADS } from '../utils/sampleData';

const ADS_COLLECTION = 'ads';

function docToAd(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    bx: data.bx,
    by: data.by,
    bw: data.bw,
    bh: data.bh,
    color: data.color,
    label: data.label,
    url: data.url,
    owner: data.owner,
    imageUrl: data.imageUrl || null,
  };
}

export async function getAds() {
  try {
    const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await seedSampleAds();
      const seeded = await getDocs(q);
      return seeded.docs.map(docToAd);
    }

    return snapshot.docs.map(docToAd);
  } catch (err) {
    console.error('Failed to fetch ads:', err.message);
    // Fallback: try without orderBy (in case index not ready)
    try {
      const fallback = await getDocs(collection(db, ADS_COLLECTION));
      if (!fallback.empty) return fallback.docs.map(docToAd);
    } catch (fallbackErr) {
      console.error('Fallback fetch also failed:', fallbackErr.message);
    }
    return [];
  }
}

export async function saveAd(adData, imageFile, onProgress) {
  const progress = onProgress || (() => {});
  let imageUrl = null;

  progress('saving', 'Reserving your pixels...');

  try {
    var docRef = await addDoc(collection(db, ADS_COLLECTION), {
      bx: adData.bx,
      by: adData.by,
      bw: adData.bw,
      bh: adData.bh,
      color: adData.color,
      label: adData.label,
      url: adData.url,
      owner: adData.owner,
      imageUrl: null,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    const msg = err.code === 'permission-denied'
      ? 'Permission denied — check Firestore rules'
      : err.code === 'unavailable'
        ? 'Server unavailable — check your connection'
        : `Failed to save: ${err.message}`;
    throw new Error(msg);
  }

  if (imageFile) {
    progress('uploading', 'Uploading your image...');
    try {
      imageUrl = await uploadAdImage(docRef.id, imageFile);
      progress('finalizing', 'Finishing up...');
      await updateDoc(docFn(db, ADS_COLLECTION, docRef.id), { imageUrl });
    } catch (imgErr) {
      console.error('Image upload failed:', imgErr.message);
      progress('warning', 'Ad saved, but image upload failed — you can try again later');
    }
  }

  progress('done', 'Purchase complete!');

  return {
    id: docRef.id,
    ...adData,
    imageUrl,
  };
}

async function uploadAdImage(docId, file) {
  const ext = file.name?.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `ads/${docId}/image.${ext}`);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  return getDownloadURL(storageRef);
}

export function subscribeToAds(callback, onError) {
  const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const ads = snapshot.docs.map(docToAd);
      callback(ads);
    },
    (err) => {
      console.error('Real-time subscription error:', err.message);
      if (onError) onError(err);
    }
  );
}

// --- Site config (dynamic content from Firestore) ---

function stripAdmin(data) {
  if (!data) return data;
  const { _adminKey, ...rest } = data;
  return rest;
}

export async function getSiteConfig() {
  try {
    const snap = await getDoc(docFn(db, 'config', 'site'));
    if (snap.exists()) return stripAdmin(snap.data());
  } catch (e) {
    console.error('Failed to load site config:', e.message);
  }
  return null;
}

export function subscribeToSiteConfig(callback) {
  return onSnapshot(
    docFn(db, 'config', 'site'),
    (snap) => { if (snap.exists()) callback(stripAdmin(snap.data())); },
    (err) => console.error('Site config subscription error:', err.message)
  );
}

// --- Recent purchases feed ---

export function subscribeToRecentPurchases(callback, count = 8) {
  const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'asc'), limitToLast(count));
  return onSnapshot(
    q,
    (snapshot) => {
      const purchases = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          label: data.label,
          owner: data.owner,
          pixels: data.bw * data.bh,
          createdAt: data.createdAt,
        };
      });
      callback(purchases);
    },
    (err) => console.error('Recent purchases subscription error:', err.message)
  );
}

async function seedSampleAds() {
  try {
    const batch = writeBatch(db);
    const colRef = collection(db, ADS_COLLECTION);
    for (const ad of SAMPLE_ADS) {
      const docRef = docFn(colRef);
      batch.set(docRef, {
        bx: ad.bx,
        by: ad.by,
        bw: ad.bw,
        bh: ad.bh,
        color: ad.color,
        label: ad.label,
        url: ad.url,
        owner: ad.owner,
        imageUrl: null,
        createdAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to seed sample ads:', err.message);
  }
}

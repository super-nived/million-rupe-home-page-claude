import { SAMPLE_ADS } from '../utils/sampleData';

const STORAGE_KEY = 'LAKH_HOMEPAGE_ADS';

function readAds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data — reset
  }
  return null;
}

function writeAds(ads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
}

export function getAds() {
  const stored = readAds();
  if (stored) return stored;
  writeAds(SAMPLE_ADS);
  return SAMPLE_ADS;
}

export function saveAd(ad) {
  const ads = getAds();
  const updated = [...ads, ad];
  writeAds(updated);
  return updated;
}

export function resetAds() {
  writeAds(SAMPLE_ADS);
  return SAMPLE_ADS;
}

import { distanceMiles, type Bathroom, type Coordinates } from "./bathrooms";

interface SavedArea {
  center: Coordinates;
  savedAt: number;
  bathrooms: Bathroom[];
}

const storageKey = "bathroom-finder:saved-areas";
let inMemory: SavedArea[] = [];

function readSavedAreas(): SavedArea[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    const saved = Array.isArray(stored) ? stored.filter((entry) => (
      Number.isFinite(entry?.center?.lat) && Number.isFinite(entry?.center?.lng) &&
      Number.isFinite(entry?.savedAt) && Array.isArray(entry?.bathrooms)
    )) : [];
    return saved[0]?.savedAt > (inMemory[0]?.savedAt ?? 0) ? saved : inMemory;
  } catch {
    return inMemory;
  }
}

export function latestSavedArea() {
  return readSavedAreas()[0] ?? null;
}

export function findSavedArea(center: Coordinates) {
  return readSavedAreas().find((entry) => distanceMiles(entry.center, center) <= 0.75);
}

export function saveArea(center: Coordinates, bathrooms: Bathroom[]) {
  const approximateCenter = { lat: Number(center.lat.toFixed(3)), lng: Number(center.lng.toFixed(3)) };
  const record = { center: approximateCenter, savedAt: Date.now(), bathrooms };
  inMemory = [
    record,
    ...readSavedAreas().filter((entry) => distanceMiles(entry.center, approximateCenter) > 0.25),
  ].slice(0, 6);
  try {
    localStorage.setItem(storageKey, JSON.stringify(inMemory));
  } catch {
    // Results are still available while this page stays open.
  }
  return record;
}

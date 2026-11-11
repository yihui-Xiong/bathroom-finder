export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Bathroom extends Coordinates {
  id: string;
  name: string;
  type: string;
  operator: string;
  hours: string;
  season: string;
  accessibility: string;
  restroomType: string;
  changingStations: string;
  notes: string;
  website?: string;
  address?: string;
}

interface CityRecord {
  facility_name?: string;
  status?: string;
  latitude?: string;
  longitude?: string;
  location_type?: string;
  operator?: string;
  hours_of_operation?: string;
  open?: string;
  accessibility?: string;
  restroom_type?: string;
  changing_stations?: string;
  additional_notes?: string;
  website?: { url?: string };
}

export const citySource = "https://data.cityofnewyork.us/d/i7jb-7jku";
export const cityCenter = { lat: 40.753347, lng: -73.98418 };
const endpoint = import.meta.env.BASE_URL + "nyc-restrooms.json";

export async function loadBathrooms(signal: AbortSignal) {
  const response = await fetch(endpoint, { signal });
  if (!response.ok) throw new Error("The NYC directory is temporarily unavailable.");
  const records: CityRecord[] = await response.json();
  const seen = new Set<string>();
  return records.flatMap((record): Bathroom[] => {
    const lat = Number(record.latitude);
    const lng = Number(record.longitude);
    if (
      !record.facility_name ||
      record.status?.trim().toLowerCase() !== "operational" ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < 40.45 || lat > 40.95 || lng < -74.3 || lng > -73.65
    ) return [];
    const id = JSON.stringify([record.facility_name, lat, lng, record.operator, record.location_type]);
    if (seen.has(id)) return [];
    seen.add(id);
    const website = record.website?.url;
    return [{
      id,
      name: record.facility_name,
      type: record.location_type ?? "",
      operator: record.operator ?? "",
      lat,
      lng,
      hours: record.hours_of_operation ?? "",
      season: record.open ?? "",
      accessibility: record.accessibility ?? "",
      restroomType: record.restroom_type ?? "",
      changingStations: record.changing_stations ?? "",
      notes: record.additional_notes ?? "",
      website: website && /^https?:\/\//i.test(website) ? website : undefined,
    }];
  });
}

export type DirectionsMode = "walking" | "bicycling" | "driving";

export function directionsUrl(destination: Coordinates, travelMode: DirectionsMode) {
  const url = new URL("https://www.google.com/maps/dir/");
  url.search = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: travelMode,
  }).toString();
  return url.toString();
}

export function distanceMiles(from: Coordinates, to: Coordinates) {
  const radians = Math.PI / 180;
  const a = Math.sin((to.lat - from.lat) * radians / 2) ** 2 +
    Math.cos(from.lat * radians) * Math.cos(to.lat * radians) *
    Math.sin((to.lng - from.lng) * radians / 2) ** 2;
  return 3959 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function isAccessible(bathroom: Bathroom) {
  return /^(yes|fully accessible|accessible|ada accessible|fully ada accessible|listed as wheelchair accessible)$/i.test(bathroom.accessibility.trim());
}

export function isAllGender(bathroom: Bathroom) {
  return /\bunisex\b|all[- ]gender|gender[- ]neutral/i.test(bathroom.restroomType);
}

export const nearbySource = "https://www.refugerestrooms.org/";

interface RefugeRestroom {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  state?: string;
  accessible?: boolean;
  unisex?: boolean;
  changing_table?: boolean;
  directions?: string;
  comment?: string;
  approved?: boolean;
}

export async function loadNearbyBathrooms(origin: Coordinates, signal: AbortSignal) {
  const url = new URL("https://www.refugerestrooms.org/api/v1/restrooms/by_location");
  url.search = new URLSearchParams({
    lat: origin.lat.toFixed(4),
    lng: origin.lng.toFixed(4),
    per_page: "100",
  }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("REFUGE Restrooms lookup failed.");
  const records: RefugeRestroom[] = await response.json();
  if (!Array.isArray(records)) throw new Error("Invalid REFUGE Restrooms response.");

  return records.flatMap((record): Bathroom[] => {
    if (!record.approved || !record.name || !Number.isFinite(record.id) ||
        !Number.isFinite(record.latitude) || !Number.isFinite(record.longitude)) return [];

    return [{
      id: `refuge:${record.id}`,
      name: record.name,
      type: "Restroom",
      operator: "",
      address: [record.street, record.city, record.state].filter(Boolean).join(", "),
      lat: record.latitude,
      lng: record.longitude,
      hours: "",
      season: "",
      accessibility: record.accessible ? "Listed as wheelchair accessible" : "",
      restroomType: record.unisex ? "Gender neutral restroom" : "",
      changingStations: record.changing_table ? "Yes" : "",
      notes: [record.directions, record.comment].filter(Boolean).join("\n"),
    }];
  });
}

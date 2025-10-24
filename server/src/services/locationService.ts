import { firestoreDb } from "../lib/firebase.js";
import type { Location } from "../models/location.js";

// Helper to get collection reference
function getLocationsCollection(userId: string) {
  return firestoreDb.collection(`users/${userId}/locations`);
}

// No need for getFirestore; using firestoreDb from admin SDK

export async function fetchLatestLocation(
  userId: string
): Promise<Location | null> {
  const locationsRef = getLocationsCollection(userId);
  const snapshot = await locationsRef.orderBy("ts", "desc").limit(1).get();
  if (snapshot.empty || !snapshot.docs[0]) return null;
  return snapshot.docs[0].data() as Location;
}

export async function fetchLocationHistory(
  userId: string
): Promise<Location[]> {
  const locationsRef = getLocationsCollection(userId);
  const snapshot = await locationsRef.orderBy("ts", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as Location);
}

export function validateLocationPayload(
  payload: Partial<Location>
): string | null {
  if (
    !payload.coords ||
    typeof payload.coords.lat !== "number" ||
    typeof payload.coords.lng !== "number"
  ) {
    return "Missing or invalid coordinates";
  }
  return null;
}

export async function saveUserLocation(
  userId: string,
  coords: Location["coords"],
  device?: Location["device"]
): Promise<boolean> {
  const payload: Location = {
    uid: userId,
    ts: new Date(),
    coords,
    device: device || {},
  };
  const locationsRef = getLocationsCollection(userId);
  const docId = Date.now().toString();
  await locationsRef.doc(docId).set(payload);
  return true;
}

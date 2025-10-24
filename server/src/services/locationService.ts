import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import type { Location } from "../models/location.js";

const firestore = getFirestore();

export async function fetchLatestLocation(
  userId: string
): Promise<Location | null> {
  const locationsRef = collection(firestore, `users/${userId}/locations`);
  const q = query(locationsRef, orderBy("ts", "desc"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty || !snapshot.docs[0]) return null;
  return snapshot.docs[0].data() as Location;
}

export async function fetchLocationHistory(
  userId: string
): Promise<Location[]> {
  const locationsRef = collection(firestore, `users/${userId}/locations`);
  const q = query(locationsRef, orderBy("ts", "desc"));
  const snapshot = await getDocs(q);
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
  const locationsRef = collection(firestore, `users/${userId}/locations`);
  const docId = Date.now().toString();
  await setDoc(doc(locationsRef, docId), payload);
  return true;
}

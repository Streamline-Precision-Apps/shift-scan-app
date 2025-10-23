import { Geolocation } from "@capacitor/geolocation";
import { getAuth } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebase";

// Store the watch ID globally (module scope)
let watchId: string | null = null;

// Start watching position and send updates to Firebase
export async function startLocationWatch() {
  if (watchId) return; // already watching
  watchId = await Geolocation.watchPosition({}, async (pos, err) => {
    if (err) {
      console.error("Geolocation watch error:", err);
      return;
    }
    if (!pos) {
      console.error("Geolocation watch: position is null");
      return;
    }
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const payload = {
        uid: user.uid,
        ts: serverTimestamp(),
        coords: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
        },
        device: {
          platform:
            typeof navigator !== "undefined" ? navigator.userAgent : null,
        },
      };

      const ref = doc(
        firestore,
        `users/${user.uid}/locations/${Date.now().toString()}`
      );
      await setDoc(ref, payload);
    } catch (err) {
      console.error("Failed to send watched location to Firebase:", err);
    }
  });
}
// Stop watching position
export function stopLocationWatch() {
  if (watchId) {
    Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
}
export async function sendLocationToFirebase() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    // Get current geolocation
    const pos = await Geolocation.getCurrentPosition();
    if (!pos) throw new Error("Geolocation position is null");

    const payload = {
      uid: user.uid,
      ts: serverTimestamp(),
      coords: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed ?? null,
        heading: pos.coords.heading ?? null,
      },
      device: {
        platform: typeof navigator !== "undefined" ? navigator.userAgent : null,
      },
    };

    // Write location as a sub-collection or time series doc
    const ref = doc(
      firestore,
      `users/${user.uid}/locations/${Date.now().toString()}`
    );
    await setDoc(ref, payload);
    return { success: true };
  } catch (err) {
    console.error("Failed to send location to Firebase:", err);
    return { success: false, error: err };
  }
}

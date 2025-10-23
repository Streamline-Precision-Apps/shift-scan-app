import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const firestore = getFirestore(app);
const storage = getStorage(app);

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      // Add FCM token to the user's profile
      if (token) {
        await sendFCMTokenToServer(token);
      }
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export async function sendFCMTokenToServer(token: string) {
  try {
    const res = await fetch("/api/fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // if you use cookies/session
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error("Failed to save FCM token");
    return await res.json();
  } catch (err) {
    console.error("Error sending FCM token to server:", err);
    return { success: false };
  }
}

export { app, messaging, storage, firestore };

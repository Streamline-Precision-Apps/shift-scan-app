import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

// Only initialize once
if (!admin.apps.length) {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const serviceAccount = {
    type: process.env.FIREBASE_SERVICE_JSON_TYPE,
    project_id: process.env.FIREBASE_SERVICE_JSON_PROJECT_ID,
    private_key_id: process.env.FIREBASE_SERVICE_JSON_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_SERVICE_JSON_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
    client_email: process.env.FIREBASE_SERVICE_JSON_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_SERVICE_JSON_CLIENT_ID,
    auth_uri: process.env.FIREBASE_SERVICE_JSON_AUTH_URI,
    token_uri: process.env.FIREBASE_SERVICE_JSON_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_SERVICE_JSON_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url:
      process.env.FIREBASE_SERVICE_JSON_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_SERVICE_JSON_UNIVERSE_DOMAIN,
  };
  const options: admin.AppOptions = {
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    ...(storageBucket && { storageBucket }),
  };
  admin.initializeApp(options);
}

export const getFirebaseAdmin = (): typeof admin => admin;
export const firestoreDb = admin.firestore();
export const storage: admin.storage.Storage = admin.storage();

export async function setFCMToken({ token }: { token: string }) {
  // Minimal stub: replace with actual API call to save token to your backend
  console.log("setFCMToken called with token:", token);
  try {
    // Example: await fetch('/api/notifications/fcm-token', { method: 'POST', body: JSON.stringify({ token }) })
    return true;
  } catch (err) {
    console.error('Failed to set FCM token', err);
    return false;
  }
}

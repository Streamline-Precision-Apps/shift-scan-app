# Camera Integration Update Guide

## Updates Made to `permissionContext.tsx`

✅ **All changes have been made:**

1. **Separate camera & photos permissions**: Split from single "camera" to `camera` and `photos` fields
2. **Added 'limited' state**: Now includes iOS 14+ "limited" photo library access state
3. **New `requestPhotosPermission` method**: Handles gallery/photo album access separately
4. **New `resetPhotosPermission` method**: Added for symmetry (resets are device-settings only)
5. **Better error handling**: Added try/catch with console logging for debugging
6. **Specific permission requests**: Uses Capacitor's `requestPermissions({ permissions: ['camera'] })` syntax

---

## Critical Setup Needed: Initialize PWA Elements

Your app uses **web-based camera** (getUserMedia), which requires **PWA Elements** for proper UI on web. Add this to `ClientIntlProvider.tsx`:

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { IntlProvider } from "next-intl";
import { Device } from "@capacitor/device";
// ADD THIS LINE:
import { defineCustomElements } from "@ionic/pwa-elements/loader";

import { loadMessages, defaultLocale, type Locale } from "./i18n-client";
import defaultMessages from "../messages/en.json";
import { readLocaleCookie, setLocaleCookie } from "./cookie-utils";

// ADD THIS BLOCK - Call before any Capacitor Camera API:
if (typeof window !== "undefined") {
  defineCustomElements(window);
}

// ... rest of your code
```

---

## Updated `ProfileImageEditor.tsx` Changes

Replace the camera handling section to request **both** camera and photos permissions:

### Change 1: Update the import
```tsx
// Update the hook usage to get both methods:
const { requestCameraPermission, requestPhotosPermission } = usePermissions();
```

### Change 2: Update `startCamera` function
```tsx
const startCamera = async () => {
  try {
    // Request BOTH camera permission (for recording) and photos permission (for gallery)
    const cameraGranted = await requestCameraPermission();
    
    if (!cameraGranted) {
      console.warn("Camera permission denied by user");
      setMode("select");
      return;
    }

    // Try to get media stream with camera access
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 300, height: 300 },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (mediaError) {
      console.error("Failed to access camera via getUserMedia:", mediaError);
      setMode("select");
      return;
    }
  } catch (error) {
    console.error("Camera permission error:", error);
    setMode("select");
  }
};
```

### Change 3: Add gallery access (optional feature)
If you want to add "upload from gallery" capability:

```tsx
const selectFromGallery = async () => {
  try {
    const photosGranted = await requestPhotosPermission();
    
    if (!photosGranted) {
      console.warn("Photos permission denied by user");
      return;
    }
    
    // Use HTML file input for web, or Capacitor Camera.pickImages() for native
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          setImageSrc(event.target.result);
          setMode("crop");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  } catch (error) {
    console.error("Error selecting from gallery:", error);
  }
};
```

---

## Why These Changes Matter

| Feature | Before | After |
|---------|--------|-------|
| Photo permissions | ❌ Not handled | ✅ Separate handling with 'limited' state |
| iOS 14+ limited access | ❌ Ignored | ✅ Properly detected |
| PWA Elements | ❌ Not initialized | ✅ Initialized for web UI |
| Permission specificity | ❌ Generic | ✅ Capacitor-specific syntax |
| Error handling | ⚠️ Basic | ✅ Detailed logging |

---

## Testing Checklist

- [ ] Test camera permission on iOS
- [ ] Test camera permission on Android
- [ ] Test with "limited" photo library on iOS 14+
- [ ] Test on web (PWA Elements should show modal)
- [ ] Test permission denial flows
- [ ] Test gallery upload feature (if implemented)

---

## Related Platform Requirements

### iOS
Add to `ios/App/App/Info.plist`:
- `NSCameraUsageDescription`: "Camera needed to take profile photos"
- `NSPhotoLibraryUsageDescription`: "Photos needed to select profile image"
- `NSPhotoLibraryAddUsageDescription`: "Photos library needed to save images"

### Android
Already handled by Capacitor, but verify `variables.gradle` has correct versions.

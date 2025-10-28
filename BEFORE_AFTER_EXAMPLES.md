# Before & After Code Examples

## 1. Permission Context Hook Usage

### BEFORE ❌

```typescript
const ProfileImageEditor = () => {
  const { requestCameraPermission } = usePermissions();

  // Only camera permission, no gallery support
  const startCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    // start camera...
  };
};
```

### AFTER ✅

```typescript
const ProfileImageEditor = () => {
  const {
    requestCameraPermission,
    requestPhotosPermission, // NEW!
    permissionStatus,
  } = usePermissions();

  // Camera permission
  const startCamera = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    // start camera...
  };

  // Gallery permission - NEW!
  const selectFromGallery = async () => {
    const granted = await requestPhotosPermission();
    if (!granted) return;
    // open file picker...
  };

  // Check iOS limited state - NEW!
  useEffect(() => {
    if (permissionStatus.photos === "limited") {
      console.log("User has limited photo access");
    }
  }, [permissionStatus.photos]);
};
```

---

## 2. Permission Status Checking

### BEFORE ❌

```typescript
// Limited information
const { permissionStatus } = usePermissions();

if (permissionStatus.camera === "granted") {
  // Use camera
}

// No way to know about photo library access
// No way to handle iOS limited state
```

### AFTER ✅

```typescript
const { permissionStatus } = usePermissions();

// Check camera - same as before
if (permissionStatus.camera === "granted") {
  // Use camera
}

// NEW: Check photos - gallery support
if (
  permissionStatus.photos === "granted" ||
  permissionStatus.photos === "limited"
) {
  // Can access photos (limited counts as usable)
}

// NEW: Handle iOS 14+ limited library
if (permissionStatus.photos === "limited") {
  showMessage("You can select specific photos from your library");
}

// NEW: Check all permissions
console.log(permissionStatus);
// {
//   camera: "granted",
//   photos: "limited",      ← NEW field
//   location: "denied"
// }
```

---

## 3. Error Handling

### BEFORE ❌

```typescript
const startCamera = async () => {
  try {
    const granted = await requestCameraPermission();
    // ...
  } catch (error) {
    // Silent fail, hard to debug
    console.error("Error:", error);
    setMode("select");
  }
};
```

### AFTER ✅

```typescript
const startCamera = async () => {
  try {
    const granted = await requestCameraPermission();
    // ...
  } catch (error) {
    // Detailed error handling
    console.error("Camera permission error:", error);

    // Optional: User-friendly message
    if (error instanceof Error) {
      showErrorMessage(error.message);
    }

    setMode("select");
  }
};
```

---

## 4. PWA Elements Initialization

### BEFORE ❌

```typescript
// app/layout.tsx or root component
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* Camera modal may not work properly on web */}
        {children}
      </body>
    </html>
  );
}
```

### AFTER ✅

```typescript
// app/lib/client/ClientIntlProvider.tsx
"use client";
import { defineCustomElements } from "@ionic/pwa-elements/loader";

// Initialize PWA Elements for Camera UI on web ✨
if (typeof window !== "undefined") {
  defineCustomElements(window);
}

export default function ClientIntlProvider({ children }) {
  // ... rest of component
}
```

**Result:** Camera modal now displays properly on web ✅

---

## 5. iOS Configuration

### BEFORE ❌

```xml
<!-- info.plist - Missing camera/photo descriptions -->
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <!-- Other keys but no camera permissions -->
</dict>
</plist>
```

### AFTER ✅

```xml
<!-- info.plist - Complete permissions -->
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <!-- Camera permission ✨ -->
  <key>NSCameraUsageDescription</key>
  <string>We need camera access to take your profile photo</string>

  <!-- Photo library read permission ✨ -->
  <key>NSPhotoLibraryUsageDescription</key>
  <string>We need access to your photos to select a profile image</string>

  <!-- Photo library write permission ✨ -->
  <key>NSPhotoLibraryAddUsageDescription</key>
  <string>We need to save photos to your library</string>

  <!-- Other keys... -->
</dict>
</plist>
```

**Impact:** iOS app will now request permissions properly ✅

---

## 6. Permission Request Flow

### BEFORE ❌

```typescript
// No way to request specific permissions
const result = await Camera.requestPermissions();
// Requests all, or nothing

// No distinction between camera and photos
```

### AFTER ✅

```typescript
// Can request specific permissions ✨
const cameraPerm = await Camera.requestPermissions({
  permissions: ["camera"],
});
// { camera: "granted", photos?: "unknown" }

const photoPerm = await Camera.requestPermissions({
  permissions: ["photos"],
});
// { camera?: "unknown", photos: "granted" }

// Both ✨
const bothPerm = await Camera.requestPermissions({
  permissions: ["camera", "photos"],
});
// { camera: "granted", photos: "granted" }
```

---

## 7. Permission State Handling

### BEFORE ❌

```typescript
// Only 4 states possible
type PermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unknown";

// No way to handle iOS 14+ limited access
```

### AFTER ✅

```typescript
// Now 6 states possible for camera/photos
type CameraPermissionStatus =
  | "granted" // Full access
  | "denied" // Rejected
  | "prompt" // First time ask
  | "prompt-with-rationale" // Explain why first
  | "limited" // ✨ iOS 14+ partial
  | "unknown"; // Could not determine

// Use it
const { permissionStatus } = usePermissions();

if (permissionStatus.photos === "limited") {
  // Handle iOS 14+ limited photo library
  // User can select specific photos
  // Still usable! ✅
}
```

---

## 8. Gallery Feature Implementation

### BEFORE ❌

```typescript
// No gallery feature available
<button onClick={() => setMode("camera")}>Take Photo Only</button>

// Users can't select from gallery
```

### AFTER ✅

```typescript
// NEW: Gallery feature now possible
const selectFromGallery = async () => {
  const photosGranted = await requestPhotosPermission();

  if (!photosGranted) {
    showError("Photos access required");
    return;
  }

  // Open file picker
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
};

// UI with both options
<button onClick={() => setMode("camera")}>
  Take Photo
</button>
<button onClick={selectFromGallery}>
  Choose from Gallery ✨
</button>
```

---

## 9. Type Safety Improvements

### BEFORE ❌

```typescript
// Type casting needed
const cameraPerm = await Camera.checkPermissions();
const status = cameraPerm.camera as PermissionStatusString;
// Might not be accurate - limited state not in type

// Photos not typed
const photos = cameraPerm.photos; // any
```

### AFTER ✅

```typescript
// Proper typing throughout
const cameraPerm = await Camera.checkPermissions();
const cameraStatus: CameraPermissionStatus = cameraPerm.camera || "unknown";
const photosStatus: CameraPermissionStatus = cameraPerm.photos || "unknown";

// IDE autocomplete works perfectly
if (cameraStatus === "limited") {
  // ✅ Recognized as valid state
  // TypeScript knows this is possible
}

// Both camera and photos are now properly typed
type PermissionState = {
  camera: CameraPermissionStatus;
  photos: CameraPermissionStatus;
  location: LocationPermissionStatus;
};
```

---

## 10. Logging & Debugging

### BEFORE ❌

```typescript
const refreshPermissionStatus = async () => {
  try {
    const cameraPerm = await Camera.checkPermissions();
    cameraStatus = cameraPerm.camera;
  } catch {
    cameraStatus = "unknown";
  }
  // No indication of what went wrong
};
```

### AFTER ✅

```typescript
const refreshPermissionStatus = async () => {
  try {
    const cameraPerm = await Camera.checkPermissions();
    cameraStatus = cameraPerm.camera || "unknown";
    photosStatus = cameraPerm.photos || "unknown";
  } catch (error) {
    console.error("Error checking camera permissions:", error);
    cameraStatus = "unknown";
    photosStatus = "unknown";
  }

  try {
    const locationPerm = await Geolocation.checkPermissions();
    locationStatus = locationPerm.location || "unknown";
  } catch (error) {
    console.error("Error checking location permissions:", error);
    locationStatus = "unknown";
  }

  // Clear logging for debugging ✅
};
```

---

## Summary of Improvements

| Feature                | Before     | After       |
| ---------------------- | ---------- | ----------- |
| Camera permission      | ✓          | ✓ Same      |
| Photos permission      | ✗          | ✅ NEW      |
| iOS limited state      | ✗          | ✅ NEW      |
| Permission specificity | ⚠️ Generic | ✅ Specific |
| Type safety            | ⚠️ Basic   | ✅ Full     |
| Error logging          | ✗          | ✅ Detailed |
| Gallery feature        | ✗          | ✅ NEW      |
| PWA Elements           | ✗          | ✅ NEW      |
| Documentation          | ✗          | ✅ Complete |

---

**Total Time to Update ProfileImageEditor:** ~5 minutes
**Complexity:** Low ✅
**Value Added:** High 📈

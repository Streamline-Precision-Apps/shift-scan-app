# Permission Flow Diagram

## Camera Permission Flow

```
usePermissions Hook
    ↓
┌─────────────────────────────────────────────────┐
│  requestCameraPermission()                      │
│  - Calls Camera.requestPermissions({            │
│      permissions: ['camera']                    │
│    })                                            │
│  - Refreshes permission status                  │
│  - Returns boolean                              │
└─────────────────────────────────────────────────┘
    ↓
Check Result
    ├─ "granted" → return true → Allow camera
    ├─ "denied" → return false → Show error message
    ├─ "prompt" → Shows system dialog
    ├─ "prompt-with-rationale" → Android: explain why first
    ├─ "limited" → return true → Allow with restrictions (iOS)
    └─ "unknown" → return false → Retry later

permissionStatus object tracks all three:
├─ camera: CameraPermissionStatus
├─ photos: CameraPermissionStatus (new!)
└─ location: LocationPermissionStatus
```

## Updated Permission State Types

```typescript
// BEFORE (Limited):
type PermissionStatusString = 
  | "granted"
  | "denied" 
  | "prompt"
  | "prompt-with-rationale"
  | "unknown"

// AFTER (Comprehensive):
type CameraPermissionStatus = 
  | "granted"              // Full access
  | "denied"               // User rejected
  | "prompt"               // Ask for first time
  | "prompt-with-rationale" // Android: explain first
  | "limited"              // iOS 14+: partial access ✨ NEW
  | "unknown"              // Could not determine

// Separate permission for location (unchanged):
type LocationPermissionStatus = 
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale"
  | "unknown"
```

## Permission Object Structure

```typescript
PermissionState = {
  camera: CameraPermissionStatus,  // Camera recording
  photos: CameraPermissionStatus,  // Gallery/album access ✨ NEW FIELD
  location: LocationPermissionStatus
}

// Example states:
{
  camera: "granted",              // User allowed camera
  photos: "limited",              // iOS 14+ limited library
  location: "prompt"              // Not yet asked
}
```

## Updated API Calls

```typescript
// BEFORE:
const result = await Camera.requestPermissions();
// Returns: { camera: string }

// AFTER:
const result = await Camera.requestPermissions({ 
  permissions: ['camera'] 
});
// Returns: { camera: string, photos: string }

// Can also request specific permissions:
const result = await Camera.requestPermissions({ 
  permissions: ['photos'] 
});
// Returns: { camera?: string, photos: string }
```

## usePermissions Hook - Method Signatures

```typescript
interface PermissionsContextType {
  // Camera capture
  requestCameraPermission(): Promise<boolean>
  resetCameraPermission(): void
  
  // Photo library access ✨ NEW
  requestPhotosPermission(): Promise<boolean>
  resetPhotosPermission(): void
  
  // Location tracking
  requestLocationPermission(): Promise<{ success: boolean }>
  resetLocationPermission(): void
  
  // Get current state
  permissionStatus: PermissionState
  refreshPermissionStatus(): Promise<void>
}
```

## Usage Examples

```typescript
// Check if camera is available
const { permissionStatus } = usePermissions();
if (permissionStatus.camera === "granted") {
  // Safe to use camera
}

// Request camera access
const { requestCameraPermission } = usePermissions();
const canUseCamera = await requestCameraPermission();
if (canUseCamera) {
  startCamera();
}

// Handle iOS limited library
const { permissionStatus } = usePermissions();
if (permissionStatus.photos === "limited") {
  console.log("User allowed limited photo access");
  // Still usable - user picked specific photos
}

// Refresh to check current state
const { refreshPermissionStatus } = usePermissions();
await refreshPermissionStatus();
// permissionStatus is now up-to-date
```

## Capacitor Camera.getPhoto() Alternative

If you switch to Capacitor's Camera API (instead of getUserMedia):

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const takePicture = async () => {
  try {
    // Capacitor handles permissions internally
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,  // File path
      source: CameraSource.Camera         // Or CameraSource.Photos
    });
    
    // image.webPath is ready to use in <img> tags
    setImageSrc(image.webPath);
  } catch (error) {
    console.error('Error taking photo:', error);
  }
};
```

## Platform-Specific Behaviors

### Web
- PWA Elements modal appears ✅ (now initialized)
- Falls back to file input if PWA Elements unavailable
- getUserMedia for camera access (you're using this)

### iOS
- First request shows system dialog
- "limited" state = iOS 14+ partial library access
- Camera takes photo and prompts to save
- Info.plist entries required (Usage Descriptions)

### Android
- System prompt shows permission request
- "prompt-with-rationale" = show explanation first
- Photo Picker (Android 11+) or fallback to file picker
- Permissions in AndroidManifest.xml (auto-configured)

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| Camera permission | ✓ | ✓ |
| Photos permission | ✗ | ✓ NEW |
| Limited state | ✗ | ✓ NEW |
| Rationale state | ✓ | ✓ |
| PWA Elements init | ✗ | ✓ NEW |
| Permission syntax | Generic | Capacitor-specific ✓ |
| Error logging | Basic | Detailed ✓ |

---

## Testing Permission States

```typescript
// In browser DevTools, test permission states:
await navigator.permissions.query({ name: 'camera' });
// Returns: { state: 'granted' | 'denied' | 'prompt' }

// In mobile, test via Settings:
iOS: Settings → Privacy → Camera/Photos
Android: Settings → Apps → Permissions → Camera/Photos
```

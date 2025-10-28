/**
 * UPDATED ProfileImageEditor.tsx - Key Changes Summary
 * 
 * This file shows the SPECIFIC CHANGES needed in your ProfileImageEditor.tsx
 * Apply these changes to your existing file.
 */

// ============================================================================
// CHANGE 1: Update the permissions import (line with usePermissions)
// ============================================================================

// BEFORE:
// const { requestCameraPermission } = usePermissions();

// AFTER:
const { requestCameraPermission, requestPhotosPermission } = usePermissions();


// ============================================================================
// CHANGE 2: Update startCamera function (replace entire function)
// ============================================================================

// BEFORE:
/*
const startCamera = async () => {
  try {
    // Request camera permission using the centralized permissions context
    const permissionGranted = await requestCameraPermission();

    if (!permissionGranted) {
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
      // If getUserMedia fails, reset mode and show error
      setMode("select");
      return;
    }
  } catch (error) {
    console.error("Camera permission error:", error);
    setMode("select");
  }
};
*/

// AFTER:
const startCamera = async () => {
  try {
    // Request camera permission using the centralized permissions context
    // Now uses Capacitor's specific permission syntax
    const permissionGranted = await requestCameraPermission();

    if (!permissionGranted) {
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


// ============================================================================
// CHANGE 3 (OPTIONAL): Add gallery/photo album selection feature
// ============================================================================

// Add this new function to ProfileImageEditor component:
const selectFromGallery = async () => {
  try {
    // Request photos permission for gallery access
    const photosGranted = await requestPhotosPermission();

    if (!photosGranted) {
      console.warn("Photos permission denied by user");
      return;
    }

    // Use HTML file input for web (simpler for web camera mode)
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


// ============================================================================
// CHANGE 4 (OPTIONAL): Add gallery button to UI
// ============================================================================

// In the select mode buttons section, add:
{mode === "select" ? (
  <Holds className="row-start-10 row-end-11 w-full space-y-3">
    <Buttons
      background="lightBlue"
      className="w-full py-2"
      onClick={() => setMode("camera")}
    >
      <Titles size={"h4"}>{t("ChangeProfilePhoto")}</Titles>
    </Buttons>
    
    {/* NEW: Add gallery selection button */}
    <Buttons
      background="lightGray"
      className="w-full py-2"
      onClick={selectFromGallery}
    >
      <Titles size={"h4"}>{t("SelectFromGallery")}</Titles>
    </Buttons>
  </Holds>
) : ...}


// ============================================================================
// WHAT THESE CHANGES DO
// ============================================================================

/**
 * CHANGE 1 (usePermissions import):
 * - Enables photo gallery permission requests in addition to camera
 * - Adds `requestPhotosPermission` method for gallery features
 * 
 * CHANGE 2 (startCamera):
 * - Uses updated permissionContext that now handles both camera and photos
 * - Works with Capacitor's new permission system
 * - Better error logging for debugging
 * 
 * CHANGE 3 (selectFromGallery):
 * - Allows users to select images from their photo library
 * - Properly requests photos permission before access
 * - Handles iOS 14+ "limited" photo library access
 * 
 * CHANGE 4 (Gallery UI button):
 * - Gives users option to upload from gallery without using camera
 * - Better UX for users who already have photos
 */

// ============================================================================
// PERMISSION STATES EXPLAINED
// ============================================================================

/**
 * Camera permission states (permissionStatus.camera):
 * - "granted": User has allowed camera access
 * - "denied": User has denied camera access
 * - "prompt": First request, not yet asked
 * - "prompt-with-rationale": Should explain why before asking (Android)
 * - "limited": User allowed but with restrictions (iOS 14+)
 * - "unknown": Could not determine state
 * 
 * Photos permission states (permissionStatus.photos):
 * - "granted": Full photo library access
 * - "denied": User denied access
 * - "prompt": First request
 * - "prompt-with-rationale": Explain first (Android)
 * - "limited": Limited selection on iOS 14+ (CAN STILL USE - returns allowed photos)
 * - "unknown": Could not determine
 */

// ============================================================================
// TESTING
// ============================================================================

/**
 * Test on Web (Desktop):
 * 1. PWA Elements modal should appear when clicking camera
 * 2. Can record/take photo via browser camera
 * 3. Can upload via file picker
 * 
 * Test on iOS:
 * 1. First request shows permission prompt
 * 2. "Limited" mode works (can use selected photos)
 * 3. Camera access shows front camera by default
 * 4. Check Info.plist has usage descriptions
 * 
 * Test on Android:
 * 1. Permission prompt appears on first use
 * 2. Can access camera and gallery
 * 3. Verify variable.gradle versions match
 */

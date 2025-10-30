# Employee Location Tracking Plan (iOS & Android, Capacitor + Cordova)

## Overview

This document describes how to implement employee location tracking in a Capacitor app (iOS & Android) using both the Capacitor Geolocation API and the Cordova Background Geolocation plugin. The goal is to:

- Request location permission once at registration/onboarding.
- Only track location when the employee is clocked in.
- Stop all tracking when the employee clocks out.
- Support both foreground and background tracking.

---

## 1. Permission Request

- On first app launch or registration, request location permission using Capacitor Geolocation's `requestPermissions()`.
- iOS: Add `NSLocationAlwaysAndWhenInUseUsageDescription` and `NSLocationWhenInUseUsageDescription` to `Info.plist`.
- Android: Add `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` to `AndroidManifest.xml`.

## 2. Tracking Start/Stop Logic

- **When employee clocks in:**
  - Start location tracking:
    - Use Capacitor Geolocation's `watchPosition` for foreground.
    - Use Cordova Background Geolocation plugin for background.
  - Configure background plugin with appropriate intervals, accuracy, and notification.
- **When employee clocks out:**
  - Stop all location tracking:
    - Call `clearWatch` for Capacitor Geolocation.
    - Call `stop` and `removeAllListeners` for Cordova plugin.

## 3. App Lifecycle

- Ensure background plugin is only running when employee is clocked in.
- On app resume, check if employee is clocked in and re-enable tracking if needed.
- On app pause/terminate, background plugin continues if clocked in, otherwise stops.

## 4. Data Handling

- On each location update, send data to backend with user ID and timestamp.
- Use Cordova plugin's `postTemplate` or manual fetch for custom payloads.

## 5. User Experience

- Show clear messaging about why location is needed at registration.
- Notify user when tracking is active (especially on Android, via notification).

## 6. Testing

- Test on both iOS and Android for permission prompts, background/foreground transitions, and start/stop logic.

---

## References

- [Capacitor Geolocation API](https://capacitorjs.com/docs/apis/geolocation)
- [Cordova Background Geolocation Plugin](https://github.com/mauron85/cordova-plugin-background-geolocation)

---

**Summary:**

- Request permission once at registration.
- Start tracking only when clocked in, stop when clocked out.
- Use Capacitor Geolocation for foreground, Cordova plugin for background.
- Ensure proper configuration and user messaging for both platforms.

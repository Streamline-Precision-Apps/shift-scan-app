"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import QrScanner from "qr-scanner";
import { equipmentType } from "./companyDocuments";
import { usePermissions } from "@/app/context/PermissionsContext";

type EquipmentQrReaderProps = {
  handleNextStep: () => void;
  setScanned: React.Dispatch<React.SetStateAction<string | null>>;
  startCamera: boolean;
  setStartCamera: (start: boolean) => void;
  setScanError: (error: boolean) => void;
  setScanErrorType: (type: "camera" | "permission" | "invalid" | null) => void;
  equipment: equipmentType[];
};

// Extended type for MediaTrackCapabilities with torch
interface MediaTrackCapabilitiesWithTorch extends MediaTrackCapabilities {
  torch?: boolean;
}

// Extended type for MediaTrackConstraintSet with torch
interface MediaTrackConstraintSetWithTorch extends MediaTrackConstraintSet {
  advanced?: { torch?: boolean }[];
}

export default function Qr({
  handleNextStep,
  setScanned,
  startCamera,
  setStartCamera,
  setScanError,
  setScanErrorType,
  equipment,
}: EquipmentQrReaderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const { requestCameraPermission, permissions } = usePermissions();

  // Performance patch: Override getContext for better canvas performance
  useEffect(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      options?: CanvasRenderingContext2DSettings,
    ) {
      if (type === "2d") {
        options = { ...options, willReadFrequently: true };
      }
      return originalGetContext.call(this, type, options);
    } as typeof originalGetContext;

    return () => {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    };
  }, []);

  const validateEquipment = useCallback(
    (data: string) => {
      if (!data || typeof data !== "string") return false;
      return equipment.some((item) => item.qrId === data.trim());
    },
    [equipment],
  );

  const checkCameraPermissions = useCallback(async () => {
    try {
      // First check if we already have camera permissions
      if (permissions?.camera === true) {
        return true;
      }

      // If not, request camera access through the centralized permissions context
      const permissionGranted = await requestCameraPermission();

      if (!permissionGranted) {
        console.error("Camera permission denied");
        setScanError(true);
        setScanErrorType("permission");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Camera permission denied:", error);
      setScanError(true);
      setScanErrorType("permission");
      return false;
    }
  }, [permissions, setScanError, setScanErrorType, requestCameraPermission]);

  const handleScanSuccess = useCallback(
    (result: QrScanner.ScanResult) => {
      try {
        const { data } = result;

        if (!validateEquipment(data)) {
          setScanErrorType("invalid");
          throw new Error("Invalid equipment QR code");
        }

        setScanned(data);
        qrScannerRef.current?.stop();
        setStartCamera(false);
        handleNextStep();
      } catch (error) {
        console.error("Equipment QR Code Processing Error:", error);
        qrScannerRef.current?.stop();
        setScanError(true);
        setStartCamera(false);
      }
    },
    [
      validateEquipment,
      setScanned,
      setScanError,
      setScanErrorType,
      handleNextStep,
    ],
  );

  const handleScanFail = useCallback(
    (error: Error | string) => {
      console.error("QR Scan Error:", error);
      setTimeout(() => {
        if (qrScannerRef.current && startCamera) {
          qrScannerRef.current.start().catch((err) => {
            console.error("Failed to restart scanner:", err);
            setScanError(true);
            setStartCamera(false);
          });
        }
      }, 1000);
    },
    [startCamera, setScanError],
  );

  const toggleFlash = async () => {
    if (!qrScannerRef.current) return;

    try {
      const videoElement = qrScannerRef.current.$video;
      if (!videoElement.srcObject) return;

      const stream = videoElement.srcObject as MediaStream;
      const [track] = stream.getVideoTracks();

      if (track) {
        const capabilities =
          track.getCapabilities() as MediaTrackCapabilitiesWithTorch;
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashOn } as MediaTrackConstraintSetWithTorch],
          });
          setFlashOn(!flashOn);
        }
      }
    } catch (error) {
      console.error("Failed to toggle flash:", error);
    }
  };

  useEffect(() => {
    let scanner: QrScanner | null = null;
    let mounted = true;

    const initScanner = async () => {
      if (!startCamera || !videoRef.current || !mounted) return;

      try {
        // Use the permissions state to determine if we need to check permissions
        const hasPermission =
          permissions.camera || (await checkCameraPermissions());
        if (!hasPermission) return;

        scanner = new QrScanner(videoRef.current, handleScanSuccess, {
          onDecodeError: handleScanFail,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          preferredCamera: "environment",
          maxScansPerSecond: 3,
          calculateScanRegion: (video) => ({
            x: video.videoWidth * 0.35,
            y: video.videoHeight * 0.25,
            width: video.videoWidth * 0.3,
            height: video.videoHeight * 0.5,
            downScaledWidth: 300,
            downScaledHeight: 300,
          }),
        });

        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setScanErrorType("camera");
          throw new Error("No camera available");
        }

        await scanner.start();
        qrScannerRef.current = scanner;
        setIsLoading(false);

        // Check for flash capability
        const videoElement = scanner.$video;
        if (videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          const [track] = stream.getVideoTracks();

          if (track) {
            const capabilities =
              track.getCapabilities() as MediaTrackCapabilitiesWithTorch;
            if (capabilities.torch) {
              setHasFlash(true);
            }
          }
        }
      } catch (error) {
        console.error("Scanner initialization error:", error);
        if (mounted) {
          setScanError(true);
          setStartCamera(false);
          setIsLoading(false);
        }
        scanner?.stop();
      }
    };

    initScanner();

    return () => {
      mounted = false;
      scanner?.stop();
      scanner?.destroy();
      qrScannerRef.current = null;
    };
  }, [
    startCamera,
    handleScanSuccess,
    handleScanFail,
    checkCameraPermissions,
    setScanError,
    setScanErrorType,
    permissions,
  ]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full rounded-[10px] border-[3px] border-black bg-black bg-opacity-85 object-cover"
        aria-label="QR scanner video stream"
      >
        Video stream not available. Please enable your camera.
      </video>

      {isLoading && startCamera && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-[10px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {startCamera && !isLoading && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-green-500 rounded-lg w-3/4 h-1/2 relative">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-green-500"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-green-500"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-green-500"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-green-500"></div>
            </div>
          </div>

          {hasFlash && (
            <button
              onClick={toggleFlash}
              className="absolute top-4 right-4 bg-black bg-opacity-50 p-2 rounded-full"
              aria-label={flashOn ? "Turn flash off" : "Turn flash on"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
}

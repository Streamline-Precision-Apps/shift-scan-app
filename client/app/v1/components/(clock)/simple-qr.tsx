"use client";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import QrScanner from "qr-scanner";

export default function SimpleQr({
  setScannedId,
  setScanned,
  onScanComplete,
  resetOnMount = false,
}: {
  setScanned: Dispatch<SetStateAction<boolean>>;
  setScannedId: Dispatch<SetStateAction<string | null>>;
  onScanComplete?: (scannedId: string) => Promise<void>;
  resetOnMount?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const hasScanned = useRef(false);

  // Function to reset the scanner state
  const resetScanner = useCallback(() => {
    hasScanned.current = false;
    if (qrScannerRef.current) {
      qrScannerRef.current
        .start()
        .catch((err) => console.error("Error restarting scanner:", err));
    }
  }, []);

  const handleScanSuccess = useCallback(
    async (result: QrScanner.ScanResult) => {
      try {
        const { data } = result;

        if (data && !hasScanned.current) {
          hasScanned.current = true;
          setScannedId(data);
          setScanned(true);

          if (onScanComplete && hasScanned.current) {
            await onScanComplete(data);
          }

          // Stop the scanner immediately after a successful scan
          qrScannerRef.current?.stop();
        }
      } catch (error) {
        console.error("Error processing scanned data:", error);
        hasScanned.current = false; // Reset on error
      }
    },
    [setScanned, setScannedId, onScanComplete],
  );

  useEffect(() => {
    if (videoRef.current) {
      // Initialize the QR scanner with a callback that saves scanned data
      const scanner = new QrScanner(videoRef.current, handleScanSuccess, {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        preferredCamera: "environment",
        calculateScanRegion: (video) => {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const regionWidth = videoWidth * 0.3; // 80% of the video width
          const regionHeight = videoHeight * 0.5; // 80% of the video height
          const x = (videoWidth - regionWidth) / 2; // Center the region horizontally
          const y = (videoHeight - regionHeight) / 2; // Center the region vertically
          return {
            x,
            y,
            width: regionWidth,
            height: regionHeight,
            downScaledWidth: 400,
            downScaledHeight: 400,
          };
        },
      });

      qrScannerRef.current = scanner;

      // Check for camera availability before starting
      QrScanner.hasCamera().then((hasCamera) => {
        if (hasCamera) {
          scanner
            .start()
            .catch((err) => console.error("Error starting scanner:", err));
        } else {
          console.error("No camera found");
        }
      });
    }

    // Clean up: stop the scanner when the component unmounts
    return () => {
      qrScannerRef.current?.stop();
    };
  }, [handleScanSuccess]);

  // Reset scanner on component mount if resetOnMount is true
  useEffect(() => {
    if (resetOnMount) {
      resetScanner();
    }
  }, [resetOnMount, resetScanner]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full rounded-[10px] border-[3px] border-black bg-black bg-opacity-85  object-cover"
      aria-label="QR scanner video stream"
    >
      Video stream not available. Please enable your camera.
    </video>
  );
}

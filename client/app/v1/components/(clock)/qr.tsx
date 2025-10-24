"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  SetStateAction,
  Dispatch,
} from "react";
import QrScanner from "qr-scanner";
import { useRouter } from "next/navigation";
import { useEQScanData } from "@/app/context/equipmentContext";
import { useDBJobsite } from "@/app/context/dbCodeContext";
import { usePermissions } from "@/app/context/PermissionsContext";

type Option = {
  id: string;
  label: string;
  code: string;
};

type QrReaderProps = {
  handleScanJobsite?: (type: string) => void;
  url: string;
  clockInRole: string | undefined;
  type: string;
  handleNextStep: () => void;
  startCamera: boolean;
  setStartCamera: React.Dispatch<React.SetStateAction<boolean>>;
  setFailedToScan: React.Dispatch<React.SetStateAction<boolean>>;
  setJobsite: React.Dispatch<React.SetStateAction<Option>>;
};

export default function QR({
  handleScanJobsite,
  url,
  clockInRole,
  type,
  handleNextStep,
  startCamera,
  setStartCamera,
  setFailedToScan,
  setJobsite,
}: QrReaderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const router = useRouter();

  // Custom hooks
  const { jobsiteResults } = useDBJobsite();
  const { setscanEQResult } = useEQScanData();

  // Performance patch: Override getContext to add willReadFrequently for 2d contexts
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

  // Constants
  const SCAN_THRESHOLD = 200;

  // ------------------- Different scan processes below ----------------------------
  const processEquipmentScan = useCallback(
    (data: string) => {
      setscanEQResult({ data });
      qrScannerRef.current?.stop();
      handleNextStep();
    },
    [setscanEQResult, handleNextStep],
  );

  // In your QR component (qr-handler.tsx), update the processGeneralScan function:
  const processGeneralScan = useCallback(
    (data: string) => {
      // Find the matching jobsite from the jobsiteResults (case-insensitive)
      const matchedJobsite = jobsiteResults?.find(
        (j) => j.qrId.toLowerCase() === data.toLowerCase(),
      );
      if (matchedJobsite) {
        setJobsite({
          id: matchedJobsite.id, // Add the id
          label: matchedJobsite.name, // Add the label
          code: matchedJobsite.qrId, // Add the code (id)
        });
        qrScannerRef.current?.stop();
        if (handleScanJobsite) {
          handleScanJobsite(clockInRole || "");
        }
      } else {
        console.error("Error: Invalid QR code Scanned!", data);
        throw new Error("Invalid QR code Scanned!");
      }
    },
    [jobsiteResults, handleScanJobsite, clockInRole],
  );

  // ----------------------- End of scan processes -------------------------------

  const handleScanSuccess = useCallback(
    (result: QrScanner.ScanResult) => {
      try {
        const { data } = result;
        // Guard: Ignore empty or obviously invalid scans
        if (!data || typeof data !== "string" || data.trim() === "") {
          return;
        }

        if (
          !jobsiteResults?.some(
            (j) => j.qrId.toLowerCase() === data.toLowerCase(),
          )
        ) {
          console.error("Error: QR code not found in jobsiteResults", data);
          throw new Error("Invalid QR code Scanned!");
        }

        if (type === "equipment") {
          processEquipmentScan(data);

          handleNextStep();
          handleNextStep();
        } else {
          processGeneralScan(data);
        }
      } catch (error) {
        console.error("QR Code Processing Error:", error);
        qrScannerRef.current?.stop();
        setStartCamera(false);
        setFailedToScan(true);
      }
    },
    [
      jobsiteResults,
      type,
      processEquipmentScan,
      processGeneralScan,
      setStartCamera,
      setFailedToScan,
    ],
  );

  const handleScanFail = useCallback(() => {
    setScanCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    if (startCamera) {
      const scanner = new QrScanner(videoRef.current, handleScanSuccess, {
        onDecodeError: handleScanFail,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        preferredCamera: "environment",
        calculateScanRegion: (video) => {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const squareSize = Math.min(videoWidth, videoHeight) * 0.5;
          const x = (videoWidth - squareSize) / 2;
          const y = (videoHeight - squareSize) / 2;
          return {
            x,
            y,
            width: squareSize,
            height: squareSize,
            downScaledWidth: 400,
            downScaledHeight: 400,
          };
        },
      });

      qrScannerRef.current = scanner;

      QrScanner.hasCamera().then((hasCamera) => {
        if (hasCamera) {
          scanner.start().catch((err) => {
            // Ignore AbortError, which happens when play() is interrupted
            if (err.name === "AbortError") return;
            console.error("Scanner Start Error:", err);
          });
        } else {
          console.error("No camera found");
        }
      });
    } else {
      qrScannerRef.current?.stop();
    }

    return () => {
      qrScannerRef.current?.stop();
    };
  }, [handleScanSuccess, handleScanFail, startCamera]);

  useEffect(() => {
    if (scanCount >= SCAN_THRESHOLD) {
      qrScannerRef.current?.stop();
      setStartCamera(false);
    }
  }, [scanCount, router, setStartCamera]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full rounded-[10px] border-[3px] border-black bg-black bg-opacity-85 object-cover"
      aria-label="QR scanner video stream"
    >
      Video stream not available. Please enable your camera.
    </video>
  );
}

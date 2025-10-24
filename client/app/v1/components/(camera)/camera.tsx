"use client";
import React, { useState, useRef, useEffect } from "react";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "../(reusable)/titles";
import { Images } from "../(reusable)/images";
import { useTranslations } from "next-intl";
import { usePermissions } from "@/app/context/PermissionsContext";

interface CameraComponentProps {
  setImageBlob?: React.Dispatch<React.SetStateAction<Blob | null>>;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ setImageBlob }) => {
  const t = useTranslations("SignUpProfilePicture");
  const [cameraActive, setCameraActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { requestCameraPermission } = usePermissions();

  // Start the camera
  const startCamera = async () => {
    const constraints = {
      video: {
        width: 250,
        height: 250,
        facingMode: "user",
      },
      audio: false,
    };

    try {
      // First request camera permission using the centralized permissions context
      const permissionGranted = await requestCameraPermission();

      if (!permissionGranted) {
        setError(
          "Camera permission denied. Please grant camera access in your settings.",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera not supported in this browser.");
        return;
      }
      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setError(null);
    } catch (err) {
      setError(
        "Error accessing the camera. Please check permissions and try again.",
      );
    }
  };

  // Stop the camera
  const hideCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture the image from the video stream
  const takePicture = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 250, 250);
        const imageData = canvasRef.current.toDataURL("image/png");

        setImageSrc(imageData);

        // If the parent component wants the Blob version, provide it
        if (setImageBlob) {
          canvasRef.current.toBlob((blob) => {
            if (blob) {
              setImageBlob(blob);
            }
          }, "image/png");
        }
      }
    }
    hideCamera();
  }; // Clear the captured image
  const clearPicture = () => {
    setImageSrc(null);
    if (setImageBlob) {
      setImageBlob(null);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      hideCamera();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative flex items-center justify-center mb-4">
        <div className="relative w-[260px] h-[260px] flex items-center justify-center">
          {/* Remove/Retake button (top-right) */}
          {imageSrc && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={clearPicture}
              className="absolute top-2 right-2 z-30 bg-white  hover:bg-opacity-100 border border-gray-300 rounded-full shadow-md transition-colors flex items-center justify-center"
              style={{
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
                padding: 0,
                touchAction: "manipulation",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="6" y1="6" x2="22" y2="22" />
                <line x1="22" y1="6" x2="6" y2="22" />
              </svg>
            </button>
          )}
          {!imageSrc && !cameraActive && (
            <Images
              className="w-[250px] h-[250px] opacity-50"
              titleImg="/profileEmpty.svg"
              titleImgAlt="person"
            />
          )}
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Captured"
              className="w-[250px] h-[250px] object-cover rounded-full border-8 border-black shadow-lg transition-all duration-300"
              style={{ margin: "0 auto" }}
            />
          )}
          <video
            ref={videoRef}
            id="player"
            autoPlay
            playsInline
            className={`absolute top-0 left-0 w-[250px] h-[250px] object-cover rounded-full border-8 border-black shadow-lg transition-all duration-300 ${cameraActive && !imageSrc ? "block" : "hidden"}`}
            style={{ margin: "0 auto" }}
          ></video>
          <canvas
            id="canvas"
            ref={canvasRef}
            style={{ display: "none" }}
            width="250"
            height="250"
          ></canvas>
        </div>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex flex-row gap-4 mt-2">
        {!imageSrc && (
          <Buttons
            background={cameraActive ? "green" : "lightBlue"}
            onClick={cameraActive ? takePicture : startCamera}
            className="p-3 rounded-full shadow-md text-lg font-semibold min-w-[120px]"
          >
            <Titles size={"md"}>
              {cameraActive ? t("TakePicture") : t("UseCamera")}
            </Titles>
          </Buttons>
        )}
        {cameraActive && (
          <Buttons
            background={"red"}
            onClick={() => {
              clearPicture();
              hideCamera();
            }}
            className="p-3 rounded-full shadow-md text-lg font-semibold min-w-[120px]"
          >
            <Titles size={"md"}>{t("Cancel")}</Titles>
          </Buttons>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;

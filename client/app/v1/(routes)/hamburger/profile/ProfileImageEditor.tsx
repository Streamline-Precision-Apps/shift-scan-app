"use client";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { NModals } from "@/app/v1/components/(reusable)/newmodals";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Images } from "@/app/v1/components/(reusable)/images";
import { Titles } from "@/app/v1/components/(reusable)/titles";

import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useTranslations } from "next-intl";
import Spinner from "@/app/v1/components/(animations)/spinner";
import "@/app/globals.css";
import { usePermissions } from "@/app/lib/context/permissionContext";
import { updateUserImage } from "@/app/lib/actions/userActions";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  signature?: string | null;
  image: string | null;
  imageUrl?: string | null;
};

export default function ProfileImageEditor({
  employee,
  reloadEmployee,
  loading,
  employeeName,
  setIsOpen,
  isOpen,
}: {
  employeeName: string;
  employee?: Employee;
  reloadEmployee: () => Promise<void>;
  loading: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
}) {
  const [mode, setMode] = useState<"select" | "camera" | "preview" | "crop">(
    "select"
  );

  // State for the displayed profile image
  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    employee?.image || ""
  );
  const t = useTranslations("Hamburger-Profile");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  // Update profileImageUrl when employee changes
  useEffect(() => {
    if (employee?.image) {
      setProfileImageUrl(employee.image);
    } else {
      setProfileImageUrl("");
    }
  }, [employee]);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { requestCameraPermission } = usePermissions();

  // firebase states
  const [uploading, setUploading] = useState(false);

  // Camera management
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  // Handle crop completion
  useEffect(() => {
    if (completedCrop && imageRef.current && canvasRef.current) {
      const image = imageRef.current;
      const canvas = canvasRef.current;
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");
      const pixelRatio = window.devicePixelRatio;

      canvas.width = crop.width * pixelRatio;
      canvas.height = crop.height * pixelRatio;

      if (ctx) {
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
      }
      setCropImageSrc(canvas.toDataURL("image/png"));
    }
  }, [completedCrop]);

  const startCamera = async () => {
    try {
      // First request camera permission using the centralized permissions context
      const permissionGranted = await requestCameraPermission();

      if (!permissionGranted) {
        console.error("Camera permission denied");
        setMode("select");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 300, height: 300 },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error("Camera error:", error);
      setMode("select");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setImageSrc(canvas.toDataURL("image/png"));
      setMode("crop");
    }
  };

  const saveImage = async () => {
    setIsSaving(true);
    if (!canvasRef.current || !employee?.id) {
      console.error(" Missing canvas or employee id");
      return;
    }
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setIsSaving(false);
          return;
        }

        await handleUpload(blob); // Pass Blob to handleUpload

        localStorage.setItem("userProfileImage", "Updating");
        resetState();
      }, "image/png");
    } catch (error) {
      console.error("[saveImage] Error saving image:", error);
    } finally {
      setIsSaving(false);
      await reloadEmployee();
      setIsOpen(false);
    }
  };

  const resetState = () => {
    setMode("select");
    setImageSrc("");
    setCrop(undefined);
    setCompletedCrop(null);
    stopCamera();
  };

  // todo add firebase storage bucket here

  const handleUpload = async (file: Blob) => {
    setUploading(true);
    if (!employee?.id) {
      console.warn("[handleUpload] No employee id");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", employee.id);
      formData.append("file", file, "profile.png");
      formData.append("folder", "profileImages");

      const res = await fetch("/api/uploadBlobs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const { url } = await res.json();
      // Add cache-busting param to break browser cache
      const cacheBustedUrl = `${url}?t=${Date.now()}`;

      // Update local state for immediate UI update
      setProfileImageUrl(cacheBustedUrl);

      // 4. Update user image URL in your database
      const updatingDb = await updateUserImage(employee.id, cacheBustedUrl);

      if (!updatingDb.success) {
        throw new Error("Error updating url in DB");
      }

      return cacheBustedUrl;
    } catch (err) {
      console.error("[Error uploading new image or updating DB:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Profile Image with Camera Button */}
      <div className="w-full flex justify-center relative">
        <div className="w-20 h-20 relative">
          <Images
            titleImg={
              loading
                ? "/profileEmpty.svg"
                : profileImageUrl || "/profileEmpty.svg"
            }
            titleImgAlt="profile"
            onClick={() => setIsOpen(true)}
            className={`w-full h-full rounded-full object-cover ${
              profileImageUrl && !loading ? "border-[3px] border-black" : ""
            }`}
          />
          {/* Show spinner overlay if uploading */}
          {uploading && (
            <Holds className="h-full w-full absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-full z-10"></Holds>
          )}
          <Holds className="absolute bottom-2 right-0 translate-x-1/4 translate-y-1/4 rounded-full h-8 w-8 border-2 p-0.5 justify-center items-center border-black bg-app-gray">
            <Images
              titleImg="/camera.svg"
              titleImgAlt="camera"
              onClick={() => setIsOpen(true)}
            />
          </Holds>
        </div>
      </div>

      {/* Main Modal */}
      <NModals
        size={"screen"}
        background={"noOpacity"}
        isOpen={isOpen}
        handleClose={() => {
          setIsOpen(false);
          resetState();
        }}
        className="bg-black bg-linear-to-b from-app-dark-blue to-app-blue"
      >
        <Holds className={` p-4 h-full bg-slate-100  rounded-lg `}>
          {isSaving && (
            <Holds
              background={"white"}
              className="h-full w-full fixed top-0 left-0 z-50 bg-opacity-50 flex flex-col justify-center items-center"
            >
              <Spinner size={60} color={"border-app-dark-blue"} />
            </Holds>
          )}
          {/* Back Button */}

          <Contents width={"section"} className="h-full w-full">
            <Grids rows={"10"} className="h-full w-full">
              <Holds className="row-start-1 row-end-2">
                <Titles size={"h4"}>
                  {mode === "crop"
                    ? t("CropPhoto")
                    : mode === "camera"
                    ? t("ChangeProfilePhoto")
                    : t("MyProfilePhoto")}
                </Titles>
              </Holds>

              {/* Content Area */}
              <Holds className="row-start-2 row-end-6 h-full w-full justify-center items-center">
                {mode === "camera" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-[250px] h-[250px] object-cover rounded-full border-[3px] border-black"
                  />
                ) : mode === "preview" ? (
                  <img
                    src={canvasRef.current?.toDataURL() || imageSrc}
                    alt="Preview"
                    className="w-[250px] h-[250px] object-cover rounded-full border-[3px] border-black"
                  />
                ) : mode === "crop" ? (
                  <div className="flex flex-col items-center">
                    {imageSrc && (
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        circularCrop
                        aspect={1}
                        minWidth={100}
                        minHeight={100}
                      >
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Crop preview"
                          className="max-w-full max-h-[300px]"
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            const minDimension = Math.min(
                              img.width,
                              img.height
                            );
                            setCrop({
                              unit: "px",
                              width: minDimension * 0.8,
                              height: minDimension * 0.8,
                              x: (img.width - minDimension * 0.8) / 2,
                              y: (img.height - minDimension * 0.8) / 2,
                            });
                          }}
                        />
                      </ReactCrop>
                    )}
                    <canvas
                      ref={canvasRef}
                      style={{
                        display: "none",
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                ) : (
                  <img
                    src={profileImageUrl || "/person.svg"}
                    alt="Current Profile"
                    className="w-[250px] h-[250px] object-cover rounded-full border-[3px] border-black"
                  />
                )}
              </Holds>

              {/* Action Buttons */}

              {mode === "select" ? (
                <Holds className="row-start-10 row-end-11 w-full space-y-3">
                  <Buttons
                    background="lightBlue"
                    className="w-full py-2"
                    onClick={() => setMode("camera")}
                  >
                    <Titles size={"h4"}>{t("ChangeProfilePhoto")}</Titles>
                  </Buttons>
                </Holds>
              ) : mode === "camera" ? (
                <Holds className="row-start-9 row-end-11 w-full space-y-5">
                  <Buttons
                    background="green"
                    className="w-full py-2"
                    onClick={takePicture}
                  >
                    <Titles size={"h4"}>{t("CaptureImage")}</Titles>
                  </Buttons>
                  <Buttons
                    background="red"
                    className="w-full py-2"
                    onClick={() => setMode("select")}
                  >
                    <Titles size={"h4"}>{t("Cancel")}</Titles>
                  </Buttons>
                </Holds>
              ) : mode === "crop" ? (
                <Holds className="row-start-9 row-end-10 w-full space-y-5">
                  <Buttons
                    background="green"
                    className="w-full py-2"
                    onClick={saveImage}
                    disabled={isSaving}
                  >
                    <Titles size={"h4"}>{t("Save")}</Titles>
                  </Buttons>
                  <Buttons
                    background="red"
                    className="w-full py-2"
                    onClick={() => setMode("camera")}
                  >
                    <Titles size={"h4"}>{t("Retake")}</Titles>
                  </Buttons>
                </Holds>
              ) : null}
            </Grids>
          </Contents>
        </Holds>
      </NModals>
    </>
  );
}

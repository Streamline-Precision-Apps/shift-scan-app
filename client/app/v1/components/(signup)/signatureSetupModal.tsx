"use client";

import { updateUserSignature } from "@/actions/userActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";

type SignatureProps = {
  setBase64String: Dispatch<SetStateAction<string | null>>;
  closeModal?: () => void;
};

export default function SignatureSetUpModal({
  setBase64String,
  closeModal,
}: SignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations("Hamburger-Profile");

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
      }
    }

    // Resize canvas on mount and window resize
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 🔹 Prevent touch scrolling
    const preventTouchScroll = (event: TouchEvent) => event.preventDefault();
    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, []);

  const { data: session } = useSession();
  if (!session) {
    return null;
  }

  const employee = session?.user?.id;

  // 🔹 Convert touch coordinates to match mouse event behavior
  const getTouchPos = (canvas: HTMLCanvasElement, touchEvent: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0]; // First touch only
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  // 🔹 Mouse Handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
      ctx.stroke();
      setHasStroke(true); // Mark that a stroke has occurred
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 🔹 Touch Handlers
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const pos = getTouchPos(canvas, event.nativeEvent);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      const pos = getTouchPos(canvasRef.current, event.nativeEvent);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasStroke(true); // Mark that a stroke has occurred
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  // 🔹 Clear Signature
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setHasStroke(false);
    }
  };

  // 🔹 Save Signature as Base64 Image
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Blob conversion failed");

          return;
        }

        await handleUpload(blob); // Pass Blob to handleUpload
      }, "image/png");
    }
    if (closeModal) {
      closeModal();
    }
  };

  const handleUpload = async (file: Blob) => {
    if (!employee) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", employee);
      formData.append("file", file, "profile.png");
      formData.append("folder", "signatures");

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
      setBase64String(cacheBustedUrl);

      // 4. Update user image URL in your database
      const updatingDb = await updateUserSignature(employee, cacheBustedUrl);

      if (!updatingDb.success) {
        throw new Error("Error updating url in DB");
      }

      return cacheBustedUrl;
    } catch (err) {
      console.error("[Error uploading new image or updating DB:", err);
    }
  };

  return (
    <Holds className="h-full w-full">
      <Grids rows={"5"} gap={"5"} className="h-full w-full">
        {/* Signature Pad */}
        <Holds className="row-span-4 h-full w-full items-center justify-center">
          <canvas
            ref={canvasRef}
            className="m-auto border border-black rounded-xl w-full h-48"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </Holds>

        {/* Buttons */}
        <Holds
          position={"row"}
          className="row-span-1 gap-2 h-full justify-center flex"
        >
          <Buttons background={"red"} shadow={"none"} onClick={handleClear}>
            {t("Clear")}
          </Buttons>
          <Buttons
            disabled={hasStroke === false}
            onClick={handleSave}
            shadow={"none"}
            className={`${hasStroke ? "bg-app-blue" : "bg-gray-400 "}`}
          >
            {t("Save")}
          </Buttons>
        </Holds>
      </Grids>
    </Holds>
  );
}

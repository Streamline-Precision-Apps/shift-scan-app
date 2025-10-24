import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import { Contents } from "../(reusable)/contents";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import { Texts } from "../(reusable)/texts";
import { Buttons } from "../(reusable)/buttons";
import SetCanvasPreview from "./setCanvasPreview";
import React from "react";
import { Titles } from "../(reusable)/titles";
type Props = {
  setBase64String: Dispatch<SetStateAction<string>>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  reloadEmployeeData: () => void;
};
const aspectRatio = 1 / 1;
const MIN_DIMENSION = 150;

export default function ImageCropper({
  setBase64String,
  handleFileChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSource, setImageSource] = useState<string>("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState<string | null>(null);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", (e) => {
        if (error) setError("");
        const { naturalWidth, naturalHeight } =
          e.currentTarget as HTMLImageElement;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          setError("Image must be at least 150px X 150px");
          return setImageSource("");
        }
      });
      setImageSource(imageUrl);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;
    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      aspectRatio,
      width,
      height
    );
    const CenteredCrop = centerCrop(crop, width, height);
    setCrop(CenteredCrop);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Trigger file input click
  };

  return (
    <>
      <Buttons background={"lightBlue"} onClick={handleButtonClick}>
        <Titles>Upload Image</Titles>
      </Buttons>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={onSelectFile}
      />

      {error && <Texts color="red">{error}</Texts>}
      {imageSource && (
        <Contents>
          <ReactCrop
            crop={crop}
            circularCrop
            keepSelection
            aspect={aspectRatio}
            minWidth={MIN_DIMENSION}
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
          >
            <img
              ref={imgRef}
              src={imageSource}
              alt="profile"
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <Buttons
            background={"lightBlue"}
            type="submit"
            onClick={() => {
              if (imgRef.current && canvasRef.current && crop) {
                SetCanvasPreview(
                  imgRef.current,
                  canvasRef.current,

                  convertToPixelCrop(
                    crop,
                    imgRef.current.width,
                    imgRef.current.height
                  )
                );
                const dataUrl = canvasRef.current.toDataURL();
                setBase64String(dataUrl);
              }
            }}
          >
            <Texts>Crop Image</Texts>
          </Buttons>
          <br />
          <br />
          {crop && (
            <canvas
              className="mt-5"
              ref={canvasRef}
              style={{
                display: "none",
                objectFit: "contain",
                width: 250,
                height: 250,
              }}
            ></canvas>
          )}
        </Contents>
      )}
    </>
  );
}

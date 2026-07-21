"use client";

import { useRef, useState } from "react";
import type { PhotoSlotDef } from "@/lib/style-ai/constants";

export interface PhotoState {
  file: File;
  preview: string;
}

export function PhotoSlot({
  slot,
  photo,
  onUpload,
  onRemove,
}: {
  slot: PhotoSlotDef;
  photo?: PhotoState;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    onUpload(file);
  };

  return (
    <div
      style={{
        aspectRatio: "3/4",
        borderRadius: 16,
        border: `2px dashed ${
          photo
            ? "rgba(201,168,76,0.55)"
            : dragging
              ? "rgba(201,168,76,0.8)"
              : "rgba(255,255,255,0.1)"
        }`,
        background: photo
          ? "rgba(0,0,0,0.3)"
          : dragging
            ? "rgba(201,168,76,0.05)"
            : "rgba(255,255,255,0.02)",
        cursor: photo ? "default" : "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 6,
      }}
      onClick={() => !photo && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {photo ? (
        <>
          <img
            src={photo.preview}
            alt={slot.label}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <button
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.65)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 26,
              height: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              fontSize: 11,
              zIndex: 5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
              padding: "28px 10px 10px",
              fontSize: 11,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
            }}
          >
            ✓ {slot.label}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 24, opacity: 0.25, lineHeight: 1 }}>+</div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.28)",
              fontWeight: 600,
            }}
          >
            {slot.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.16)",
              textAlign: "center",
              padding: "0 8px",
              lineHeight: 1.4,
            }}
          >
            {slot.desc}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Resizes + re-encodes an image client-side before upload. Phone photos
 * routinely come in at 3-8MB each; Vercel's serverless functions hard-cap
 * request bodies at 4.5MB (platform limit, not configurable), so
 * uploading a few originals straight from the camera roll reliably 413s.
 * Downscaling also cuts Claude's vision token cost.
 */
export async function compressImage(
  file: File,
  maxDimension = 1400,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob || blob.size >= file.size) return file;

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

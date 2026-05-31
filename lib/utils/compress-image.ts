export function calcTargetDimensions(
  w: number,
  h: number,
  maxSide: number
): { w: number; h: number } {
  const longest = Math.max(w, h);
  if (longest <= maxSide) return { w, h };
  const scale = maxSide / longest;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

export async function compressImage(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = document.createElement("img");
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = objectUrl;
  });

  const { w: targetW, h: targetH } = calcTargetDimensions(
    img.naturalWidth,
    img.naturalHeight,
    1024
  );

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context");
  ctx.drawImage(img, 0, 0, targetW, targetH);

  URL.revokeObjectURL(objectUrl);

  const dataUrl = await new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("canvas.toBlob produced null"));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.7
    );
  });

  return dataUrl;
}

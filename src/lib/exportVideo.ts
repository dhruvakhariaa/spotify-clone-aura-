/** Record a live canvas (e.g. the Aura mark) into a downloadable webm loop. */
export async function recordCanvasToWebm(canvas: HTMLCanvasElement, durationMs = 5000): Promise<Blob> {
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  return new Promise((resolve, reject) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    rec.onerror = reject;
    rec.start();
    setTimeout(() => rec.stop(), durationMs);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* Kompres foto di browser sebelum upload: sisi terpanjang maks 1600px, JPEG 85%.
   Menjaga ukuran di bawah batas body Vercel (4,5 MB). Hanya untuk client. */

export async function compressImage(file: File, maxSide = 1600): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxSide || height > maxSide) {
        if (width > height) { height = Math.round((height / width) * maxSide); width = maxSide; }
        else { width = Math.round((width / height) * maxSide); height = maxSide; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas tidak tersedia")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Gagal kompres")); return; }
        resolve(new File([blob], (file.name || "foto.jpg").replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Gagal membaca gambar")); };
    img.src = url;
  });
}

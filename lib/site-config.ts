// Build-time config via env vars — safe to use anywhere
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Travel CMS";
export const SITE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "travel";

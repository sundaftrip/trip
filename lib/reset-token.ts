import crypto from "crypto";

/**
 * Hash token reset password. Token mentah hanya ada di link email;
 * di database yang disimpan hash-nya — supaya kebocoran DB tidak
 * langsung memberi link reset yang bisa dipakai.
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

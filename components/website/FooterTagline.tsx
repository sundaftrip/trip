"use client";
import type { CSSProperties } from "react";

export default function FooterTagline({
  tagline,
  className = "",
  style,
}: {
  tagline: string;
  className?: string;
  style?: CSSProperties;
}) {
  return tagline ? <p className={className} style={style}>{tagline}</p> : null;
}

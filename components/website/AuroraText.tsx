import type { ComponentPropsWithoutRef, ReactNode } from "react";

import styles from "./AuroraText.module.css";

export interface AuroraTextProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  children: ReactNode;
  glow?: boolean;
}

export function AuroraText({
  children,
  className,
  glow = false,
  ...spanProps
}: AuroraTextProps) {
  const combinedClassName = [
    styles.auroraText,
    glow ? styles.glow : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={combinedClassName} {...spanProps}>
      {children}
    </span>
  );
}

export interface TextWithAuroraAccentProps
  extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  text: string;
  phrase: string;
  glow?: boolean;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function TextWithAuroraAccent({
  text,
  phrase,
  glow = false,
  className,
  ...spanProps
}: TextWithAuroraAccentProps) {
  const match = phrase
    ? new RegExp(escapeRegExp(phrase), "iu").exec(text)
    : null;

  if (!match) {
    return (
      <span className={className} {...spanProps}>
        {text}
      </span>
    );
  }

  const start = match.index;
  const matchedPhrase = match[0];

  return (
    <span className={className} {...spanProps}>
      {text.slice(0, start)}
      <AuroraText glow={glow}>{matchedPhrase}</AuroraText>
      {text.slice(start + matchedPhrase.length)}
    </span>
  );
}

export default AuroraText;

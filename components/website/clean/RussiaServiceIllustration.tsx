import type { ReactNode } from "react";

export type RussiaIllustrationKind =
  | "catering"
  | "flight"
  | "train"
  | "hotel"
  | "bus"
  | "luggage"
  | "show"
  | "guide"
  | "sim"
  | "compass"
  | "ruble";

const palettes: Record<RussiaIllustrationKind, [string, string, string, string]> = {
  catering: ["#FFE783", "#F6B62D", "#FFAB60", "#E16A35"],
  flight: ["#74C8FF", "#337DE3", "#ECF8FF", "#B0DCFF"],
  train: ["#FF927F", "#E64557", "#83B8ED", "#37639F"],
  hotel: ["#B59AF7", "#7861CC", "#FFE59B", "#F4B849"],
  bus: ["#70DED4", "#22AAA5", "#D1F5FC", "#84C7DE"],
  luggage: ["#FFA97F", "#ED704D", "#FFE7B0", "#F2C060"],
  show: ["#FF8B9D", "#DE3E64", "#FFE394", "#F1B749"],
  guide: ["#70DED4", "#22AAA5", "#FFE3B8", "#E7A86C"],
  sim: ["#AC9AFB", "#7560DC", "#FFE79E", "#E6B94F"],
  compass: ["#74B8FF", "#3B75D1", "#FFDF8E", "#EAB35D"],
  ruble: ["#7ADDB4", "#25A77D", "#FFE78E", "#EEB642"],
};

function Star({ x, y, color = "#F3BF5D", size = 5 }: { x: number; y: number; color?: string; size?: number }) {
  return <path d={`M${x} ${y - size} Q${x + 1} ${y - 1} ${x + size} ${y} Q${x + 1} ${y + 1} ${x} ${y + size} Q${x - 1} ${y + 1} ${x - size} ${y} Q${x - 1} ${y - 1} ${x} ${y - size}Z`} fill={color} />;
}

function Artwork({ kind, main, accent, glass }: { kind: RussiaIllustrationKind; main: string; accent: string; glass: string }): ReactNode {
  switch (kind) {
    case "catering":
      return <>
        <ellipse data-part="shadow" cx="40" cy="65" rx="27" ry="4" fill="#D6B886" opacity=".2" />
        <g data-part="body">
          <ellipse cx="40" cy="53" rx="31" ry="12" fill="#B7D7E2" />
          <ellipse cx="40" cy="50" rx="31" ry="12" fill={glass} />
          <ellipse cx="40" cy="50" rx="25" ry="8" fill="#E8F2F1" />
          <path d="M22 48C22 34 29 25 40 25S58 34 58 48C50 55 31 55 22 48Z" fill={main} />
          <path d="M27 41C28 33 33 29 39 29" fill="none" stroke="#FFF4BB" strokeWidth="3.5" strokeLinecap="round" />
          <g stroke="#D99A24" strokeWidth="1.5" strokeLinecap="round" opacity=".65">
            <path d="M34 35l2 1M43 32l2 1M48 37l-1 2M33 43l2 1M41 42l-1 2M48 46l2 1M28 47l2 1" />
          </g>
          <g transform="rotate(-15 57 50)">
            <path d="M52 42C59 37 65 40 65 46C65 51 61 54 57 52L52 56L48 52L52 48C49 46 49 44 52 42Z" fill={accent} />
            <path d="M57 43C60 41 62 42 62 45" fill="none" stroke="#FFD197" strokeWidth="2" strokeLinecap="round" />
            <path d="M48 53l-3 3" stroke="#FFF3D4" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g transform="rotate(-18 20 51)">
            <ellipse cx="20" cy="51" rx="7" ry="4.5" fill="#5BAC77" />
            <ellipse cx="20" cy="50" rx="5.4" ry="3.2" fill="#C8EAAF" />
            <path d="M18 50h4" stroke="#88C48F" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <ellipse cx="30" cy="55" rx="5" ry="2.5" fill="#F17B60" />
        </g>
        <g data-part="steam" fill="none" stroke="#D4B586" strokeWidth="2.3" strokeLinecap="round">
          <path d="M31 22c-5-4 4-6 0-11" />
          <path d="M40 20c-5-4 4-6 0-11" />
          <path d="M49 22c-5-4 4-6 0-11" />
        </g>
        <g data-part="spark"><Star x={64} y={24} size={4} /><circle cx="15" cy="32" r="2" fill="#B7D8CC" /></g>
      </>;
    case "flight":
      return <>
        <ellipse data-part="shadow" cx="41" cy="65" rx="23" ry="4" fill="#B1CBEA" opacity=".25" />
        <g data-part="trail" fill="none" stroke="#A4D5FC" strokeWidth="3" strokeLinecap="round">
          <path d="M13 46l10-10M15 57l9-9M26 65l8-8" />
        </g>
        <g data-part="body">
          <path d="M29 37L18 26L23 22L43 30L58 16C62 12 67 12 68 15C69 18 66 22 63 25L49 40L57 59L53 64L42 53L33 62L33 68L28 70L25 59L15 56L17 51L24 52L33 43Z" fill="#2F6CB7" opacity=".12" transform="translate(0 2)" />
          <path d="M29 34L18 24L23 20L44 28L51 36L58 57L53 62L42 51Z" fill={main} />
          <path d="M23 23L39 30M50 41L54 55" fill="none" stroke="#A7DEFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M59 15C63 11 68 12 68 16C67 20 63 24 59 28L33 58L32 64L28 67L25 57L15 54L18 50L25 51L54 20Z" fill={accent} />
          <path d="M30 51L58 21" fill="none" stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M57 20l5-2-2 5" fill="#2E67A9" />
          <g fill="#548FC9"><circle cx="48" cy="32" r="1.25" /><circle cx="44" cy="36" r="1.25" /><circle cx="40" cy="40" r="1.25" /></g>
        </g>
        <g data-part="spark"><Star x={18} y={15} color="#F2C56A" size={4} /><circle cx="65" cy="49" r="2.5" fill="#BFDCF7" /></g>
      </>;
    case "train":
      return <>
        <ellipse data-part="shadow" cx="41" cy="65" rx="29" ry="4" fill="#B8C9DE" opacity=".25" />
        <g data-part="body">
          <path d="M12 26C12 23 15 21 20 21H46C57 21 67 32 71 44C73 51 69 57 60 57H15C12 57 10 55 10 52V31C10 28 11 27 12 26Z" fill={glass} />
          <path d="M13 27C13 24 16 23 20 23H43C52 23 58 27 63 33H12Z" fill={main} />
          <path d="M48 30C55 30 62 36 65 41H50Z" fill={accent} />
          <path d="M51 32C55 33 59 36 61 38" fill="none" stroke="#C5E2FB" strokeWidth="2" strokeLinecap="round" />
          <rect x="16" y="32" width="9" height="10" rx="2.5" fill={accent} />
          <rect x="29" y="32" width="9" height="10" rx="2.5" fill={accent} />
          <path d="M11 46H65C69 46 71 48 70 50L68 53H11Z" fill={main} />
          <path d="M15 28h25" stroke="#FFBDB2" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 56H64" stroke="#45617B" strokeWidth="3" strokeLinecap="round" />
          <rect x="61" y="43" width="6" height="3" rx="1.5" fill="#FFE2A1" />
          <g data-part="detail"><circle cx="22" cy="58" r="4" fill="#41566D" /><circle cx="22" cy="58" r="1.7" fill="#B0CADF" /></g>
          <g data-part="detail"><circle cx="53" cy="58" r="4" fill="#41566D" /><circle cx="53" cy="58" r="1.7" fill="#B0CADF" /></g>
        </g>
        <g data-part="spark"><Star x={65} y={17} color="#F3C669" size={4} /><circle cx="17" cy="15" r="2" fill="#A9D5F4" /></g>
      </>;
    case "hotel":
      return <>
        <ellipse data-part="shadow" cx="40" cy="67" rx="25" ry="4" fill="#BEB5DF" opacity=".25" />
        <g data-part="body">
          <rect x="18" y="23" width="43" height="42" rx="6" fill={main} />
          <path d="M22 27v30" stroke="#CEBCFC" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 23C16 20 18 18 21 18H58C61 18 63 20 63 23V26H16Z" fill={accent} />
          <path d="M22 21h29" stroke="#FFF4C3" strokeWidth="2" strokeLinecap="round" />
          <g data-part="detail" fill="#EEE7FF"><rect x="27" y="32" width="7" height="8" rx="2" /><rect x="43" y="32" width="7" height="8" rx="2" /><rect x="27" y="44" width="7" height="8" rx="2" /><rect x="43" y="44" width="7" height="8" rx="2" /></g>
          <path d="M33 65V58C33 54 36 52 40 52C44 52 47 54 47 58V65Z" fill={accent} />
          <path d="M40 55v10" stroke="#CB9147" strokeWidth="1.3" />
          <rect x="14" y="63" width="51" height="4" rx="2" fill="#5D539A" />
          <g><circle cx="59" cy="19" r="11" fill="#FFDF86" /><circle cx="59" cy="19" r="8.5" fill="#FFF2BD" /><path d="M55.5 14.5v9M62.5 14.5v9M55.5 19h7" fill="none" stroke="#9E6D34" strokeWidth="2.4" strokeLinecap="round" /></g>
        </g>
        <g data-part="spark"><Star x={15} y={12} color="#B9A2E7" size={4} /><circle cx="69" cy="49" r="2" fill="#EBC479" /></g>
      </>;
    case "bus":
      return <>
        <ellipse data-part="shadow" cx="40" cy="65" rx="29" ry="4" fill="#AED5D1" opacity=".25" />
        <g data-part="body">
          <path d="M17 22H60C65 22 68 26 68 31V55C68 58 65 60 61 60H15C12 60 10 58 10 55V30C10 25 12 22 17 22Z" fill={main} />
          <path d="M17 25h39" stroke="#ACF0E6" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 29H48V43H15V32C15 30 15 29 16 29Z" fill={accent} />
          <path d="M52 29H59C62 29 63 31 63 35V43H52Z" fill="#337A95" />
          <path d="M56 31h3c2 0 2 2 2 4" fill="none" stroke="#91CDD9" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M25 29v14M37 29v14" stroke="#3AAFAF" strokeWidth="2" />
          <path d="M11 47H68V53H11Z" fill="#F2FAF8" />
          <path d="M15 55H62" stroke="#178F8D" strokeWidth="2" strokeLinecap="round" />
          <rect x="62" y="47" width="5" height="4" rx="1.5" fill="#FFDC85" />
          <rect x="9" y="34" width="4" height="9" rx="2" fill="#328994" />
          <rect x="67" y="34" width="4" height="9" rx="2" fill="#328994" />
          <g data-part="detail"><circle cx="23" cy="59" r="6" fill="#365868" /><circle cx="23" cy="59" r="3" fill="#DAEAF0" /><circle cx="23" cy="59" r="1" fill="#7594A7" /></g>
          <g data-part="detail"><circle cx="56" cy="59" r="6" fill="#365868" /><circle cx="56" cy="59" r="3" fill="#DAEAF0" /><circle cx="56" cy="59" r="1" fill="#7594A7" /></g>
        </g>
        <g data-part="spark"><Star x={58} y={13} color="#F0C573" size={4} /><circle cx="20" cy="14" r="2.2" fill="#90D8CE" /></g>
      </>;
    case "luggage":
      return <>
        <ellipse data-part="shadow" cx="41" cy="68" rx="20" ry="4" fill="#D8B8A8" opacity=".25" />
        <g data-part="body">
          <path d="M32 27V16C32 13 34 12 37 12H45C48 12 50 13 50 16V27" fill="none" stroke="#B5704B" strokeWidth="4" strokeLinecap="round" />
          <path d="M37 12h8" stroke="#FFD5AB" strokeWidth="4" strokeLinecap="round" />
          <rect x="21" y="24" width="40" height="40" rx="9" fill={main} />
          <path d="M27 30v23" stroke="#FFD1B1" strokeWidth="3" strokeLinecap="round" />
          <path d="M35 33v22M43 33v22M51 33v22" stroke="#D55D3F" strokeWidth="2.4" strokeLinecap="round" opacity=".48" />
          <rect x="36" y="25" width="10" height="3" rx="1.5" fill="#FBC393" />
          <path d="M61 34h2c3 0 3 8 0 8h-2" fill="none" stroke="#B36344" strokeWidth="3" />
          <g data-part="detail"><rect x="26" y="62" width="7" height="6" rx="2.5" fill="#715F64" /><rect x="49" y="62" width="7" height="6" rx="2.5" fill="#715F64" /></g>
          <g transform="rotate(13 53 34)"><path d="M49 24v5" stroke="#FFF2CB" strokeWidth="1.5" strokeLinecap="round" /><rect x="47" y="28" width="12" height="15" rx="3" fill={accent} /><path d="M51 33h4M51 37h3" stroke="#B28143" strokeWidth="1.5" strokeLinecap="round" /></g>
        </g>
        <g data-part="spark"><Star x={65} y={18} color="#F0C572" size={4} /><Star x={14} y={45} color="#AAD6D7" size={3.5} /></g>
      </>;
    case "show":
      return <>
        <ellipse data-part="shadow" cx="40" cy="68" rx="29" ry="4" fill="#D8B1BE" opacity=".25" />
        <g data-part="body">
          <path d="M31 21V8" stroke="#CF9345" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 8H45L41 12L45 16H32Z" fill={main} />
          <path d="M12 37H52V63H12Z" fill="#FFF3D7" />
          <path d="M12 37H20V63H12ZM28 37H36V63H28ZM44 37H52V63H44Z" fill={main} />
          <path d="M8 38L31 18L56 38Z" fill={main} />
          <path d="M19 38L31 18L30 38ZM40 38L31 18L48 38Z" fill="#FFF0D1" />
          <path d="M8 38H56" stroke="#F0BB58" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M24 64V52C24 42 40 42 40 52V64Z" fill="#8D4368" />
          <path d="M10 64H54" stroke="#D44D6C" strokeWidth="3" strokeLinecap="round" />
          <g data-part="detail">
            <path d="M53 28C58 22 64 26 59 33L54 40M65 30C61 21 69 20 69 26L65 43" fill="none" stroke="#E778A6" strokeWidth="2" strokeLinecap="round" />
            <g transform="rotate(18 53 51)">
              <rect x="47" y="37" width="12" height="28" rx="6" fill="#E884AD" />
              <rect x="49" y="39" width="8" height="14" rx="4" fill="#FFE9ED" />
              <path d="M49 43l8 7M57 43l-8 7M49 60h8" stroke="#C96791" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            <g transform="rotate(-13 65 53)">
              <rect x="59" y="39" width="12" height="28" rx="6" fill="#F3A9C6" />
              <rect x="61" y="41" width="8" height="14" rx="4" fill="#FFF0F3" />
              <path d="M61 45l8 7M69 45l-8 7M61 62h8" stroke="#D17C9E" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
          <circle cx="31" cy="34" r="3" fill={accent} />
        </g>
        <g data-part="spark"><Star x={62} y={13} size={4} /><Star x={10} y={22} color="#B2A1E4" size={3.5} /></g>
      </>;
    case "guide":
      return <>
        <ellipse data-part="shadow" cx="39" cy="69" rx="26" ry="4" fill="#ACCFC9" opacity=".25" />
        <g data-part="body">
          <path d="M16 64C16 49 23 44 35 44C47 44 54 50 54 64V67H16Z" fill={main} />
          <path d="M22 60C22 52 26 50 29 49" stroke="#B3F0E3" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 41V47C30 52 40 52 40 47V41" fill={accent} />
          <ellipse cx="35" cy="30" rx="12" ry="14" fill={accent} />
          <path d="M23 30C20 17 27 12 35 12C46 12 50 20 47 29L43 23C36 25 31 20 29 19L26 30Z" fill="#644B43" />
          <path d="M27 19C31 15 36 15 40 17" stroke="#947369" strokeWidth="2" strokeLinecap="round" />
          <g fill="#614E49"><circle cx="30" cy="30" r="1.3" /><circle cx="40" cy="30" r="1.3" /></g>
          <path d="M31 36Q35 40 39 36" fill="none" stroke="#B76F56" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M29 48L35 57L41 48" fill="none" stroke="#F4FCFA" strokeWidth="2" strokeLinejoin="round" />
          <rect x="31" y="56" width="9" height="8" rx="2" fill="#F5FAF6" />
          <path d="M33 58h5" stroke="#E96B6B" strokeWidth="2" strokeLinecap="round" />
          <g data-part="detail">
            <path d="M50 55Q62 54 62 40" fill="none" stroke="#E7A86C" strokeWidth="8" strokeLinecap="round" />
            <path d="M58 43L55 36M60 41L59 32M63 41L64 32M66 42L69 35" fill="none" stroke="#F8D2A2" strokeWidth="3.5" strokeLinecap="round" />
            <ellipse cx="62" cy="41" rx="5" ry="6" fill={accent} />
          </g>
        </g>
        <g data-part="bubble">
          <path d="M55 8H69C73 8 75 10 75 14V23C75 27 73 29 69 29H60L54 34V28C50 28 49 25 49 22V14C49 10 51 8 55 8Z" fill="#8CACED" />
          <path d="M57 14v9M64 14v9h2c6 0 6-9 0-9Z" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g data-part="spark"><Star x={15} y={17} size={4} /><circle cx="10" cy="40" r="2" fill="#B7A5EC" /></g>
      </>;
    case "sim":
      return <>
        <ellipse data-part="shadow" cx="38" cy="69" rx="23" ry="4" fill="#BFB4DF" opacity=".25" />
        <g data-part="body">
          <path d="M24 16H43L58 31V61C58 65 55 68 51 68H24C20 68 17 65 17 61V23C17 19 20 16 24 16Z" fill={main} />
          <path d="M43 17V26C43 30 46 32 50 32H57" fill="#C5B9FF" />
          <path d="M22 29V23C22 22 23 21 25 21H36" fill="none" stroke="#D7CFFF" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="25" y="39" width="25" height="21" rx="5" fill={accent} />
          <rect x="32" y="44" width="11" height="11" rx="2" fill="#FFEDAE" stroke="#CD9E42" strokeWidth="1.3" />
          <path d="M25 46h7M25 53h7M43 46h7M43 53h7M37 39v5M37 55v5" stroke="#C99A43" strokeWidth="1.4" />
        </g>
        <g data-part="signal" fill="none" strokeLinecap="round">
          <path d="M53 10C63 10 71 18 71 28" stroke="#65CFC4" strokeWidth="3.5" />
          <path d="M53 18C59 18 63 22 63 28" stroke="#3DAFAB" strokeWidth="3.5" />
          <circle cx="54" cy="27" r="2.8" fill="#278E99" stroke="none" />
        </g>
        <g data-part="spark"><Star x={66} y={52} size={4} /><circle cx="12" cy="38" r="2" fill="#B3DAD5" /></g>
      </>;
    case "compass":
      return <>
        <ellipse data-part="shadow" cx="40" cy="68" rx="23" ry="4" fill="#AEC5E2" opacity=".25" />
        <g data-part="body">
          <circle cx="40" cy="13" r="5" fill="none" stroke="#D5A556" strokeWidth="3" />
          <circle cx="40" cy="40" r="27" fill={accent} />
          <circle cx="40" cy="40" r="23" fill={main} />
          <path d="M22 34C25 23 34 19 43 21" fill="none" stroke="#B5DCFF" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="40" r="18" fill="#EBF5FF" />
          <g stroke="#88A5C8" strokeWidth="1.5" strokeLinecap="round"><path d="M40 25v3M40 52v3M25 40h3M52 40h3M29 29l2 2M49 49l2 2M29 51l2-2M49 31l2-2" /></g>
          <g data-part="detail">
            <path d="M49 23L46 43L34 37Z" fill="#EF6868" />
            <path d="M31 57L34 37L46 43Z" fill="#6D94C5" />
            <path d="M49 23L40 40L34 37Z" fill="#FF9B90" />
            <path d="M31 57L40 40L46 43Z" fill="#B6D1EE" />
            <circle cx="40" cy="40" r="3.2" fill="#FFF9EC" />
            <circle cx="40" cy="40" r="1.3" fill="#E8B65E" />
          </g>
        </g>
        <g data-part="spark"><Star x={66} y={19} color="#9BCCEA" size={4} /><circle cx="12" cy="56" r="2" fill="#E6C884" /></g>
      </>;
    case "ruble":
      return <>
        <ellipse data-part="shadow" cx="40" cy="66" rx="28" ry="4" fill="#B4D4BD" opacity=".25" />
        <g data-part="body">
          <rect x="12" y="27" width="49" height="32" rx="5" fill="#217D62" transform="rotate(-10 36 43)" />
          <rect x="11" y="24" width="49" height="32" rx="5" fill={main} />
          <path d="M19 29H52V51H19Z" fill="none" stroke="#B5EFD1" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M18 29a5 5 0 0 1-5 5M53 29a5 5 0 0 0 5 5M18 51a5 5 0 0 0-5-5M53 51a5 5 0 0 1 5-5" fill="none" stroke="#B5EFD1" strokeWidth="1.5" />
          <ellipse cx="35" cy="40" rx="11" ry="12" fill="#E1F7CF" />
          <path d="M33 48V33H37C43 33 43 41 37 41H30M30 45h8" fill="none" stroke="#328B65" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          <g data-part="detail"><circle cx="59" cy="51" r="13" fill="#D69B35" /><circle cx="59" cy="49" r="13" fill={accent} /><circle cx="59" cy="49" r="9.5" fill="none" stroke="#FFF2BF" strokeWidth="1.5" /><path d="M57 55V42H60C65 42 65 49 60 49H54M54 52h7" fill="none" stroke="#A47129" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>
        </g>
        <g data-part="spark"><Star x={60} y={17} color="#E5C46F" size={4} /><circle cx="17" cy="16" r="2" fill="#A3DAB8" /></g>
      </>;
  }
}

/** Original service artwork. Motion is controlled by the surrounding service card. */
export default function RussiaServiceIllustration({ kind }: { kind: RussiaIllustrationKind }) {
  const prefix = `sundaf-${kind}`;
  const [mainLight, mainDark, accentLight, accentDark] = palettes[kind];
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${prefix}-main`} x1="18" y1="17" x2="60" y2="66" gradientUnits="userSpaceOnUse"><stop stopColor={mainLight} /><stop offset="1" stopColor={mainDark} /></linearGradient>
        <linearGradient id={`${prefix}-accent`} x1="26" y1="18" x2="65" y2="62" gradientUnits="userSpaceOnUse"><stop stopColor={accentLight} /><stop offset="1" stopColor={accentDark} /></linearGradient>
        <linearGradient id={`${prefix}-glass`} x1="27" y1="25" x2="45" y2="63" gradientUnits="userSpaceOnUse"><stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9EAF1" /></linearGradient>
      </defs>
      <Artwork kind={kind} main={`url(#${prefix}-main)`} accent={`url(#${prefix}-accent)`} glass={`url(#${prefix}-glass)`} />
    </svg>
  );
}

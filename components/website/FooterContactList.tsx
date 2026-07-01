"use client";

import type { CSSProperties, ComponentType } from "react";
import { usePathname } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export type FooterContact = {
  kind: "address" | "phone" | "whatsapp" | "email" | "instagram" | "hours";
  label: string;
  value: string;
  href: string | null;
};

type IconProps = { size?: number; className?: string; style?: CSSProperties };

const BILLY_EMAIL = "sebastianbilly31@gmail.com";
const BILLY_WHATSAPP_DISPLAY = "+7 916 889-64-71";
const BILLY_WHATSAPP_URL = "https://wa.me/79168896471";

function InstagramIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const ICONS: Record<FooterContact["kind"], ComponentType<IconProps>> = {
  address: MapPin,
  phone: Phone,
  whatsapp: Phone,
  email: Mail,
  instagram: InstagramIcon,
  hours: Clock,
};

function partnerContact(contact: FooterContact): FooterContact {
  if (contact.kind === "whatsapp") {
    return {
      ...contact,
      value: BILLY_WHATSAPP_DISPLAY,
      href: BILLY_WHATSAPP_URL,
    };
  }

  if (contact.kind === "email") {
    return {
      ...contact,
      value: BILLY_EMAIL,
      href: `mailto:${BILLY_EMAIL}`,
    };
  }

  return contact;
}

export default function FooterContactList({
  contacts,
  iconClassName,
  iconStyle,
  linkClassName,
  linkStyle,
  textClassName,
  textStyle,
  itemClassName = "flex items-start gap-2",
}: {
  contacts: FooterContact[];
  itemClassName?: string;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  linkClassName?: string;
  linkStyle?: CSSProperties;
  textClassName?: string;
  textStyle?: CSSProperties;
}) {
  const pathname = usePathname();
  const visibleContacts = pathname === "/partner" ? contacts.map(partnerContact) : contacts;

  return (
    <>
      {visibleContacts.map(({ kind, label, value, href }) => {
        const Icon = ICONS[kind];
        return (
          <li key={label} className={itemClassName}>
            <Icon size={13} className={iconClassName} style={iconStyle} />
            {href ? (
              <a href={href} className={["inline-flex min-h-11 items-center break-words", linkClassName].filter(Boolean).join(" ")} style={linkStyle}>
                {value}
              </a>
            ) : (
              <span className={textClassName} style={textStyle}>
                {value}
              </span>
            )}
          </li>
        );
      })}
    </>
  );
}

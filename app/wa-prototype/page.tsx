import type { Metadata } from "next";
import WhatsAppClientPrototype from "@/components/prototype/WhatsAppClientPrototype";

export const metadata: Metadata = {
  title: "Prototype WhatsApp AI Sundaf Trip",
  description: "Simulasi WhatsApp calon client untuk prototype Sundaf Halo AI.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WhatsAppPrototypePage() {
  return <WhatsAppClientPrototype />;
}

export type B2BLanguage = "id" | "en" | "ru";

// Version the download URL when publishing new PDFs so cached brochures expire.
export const B2B_PROFILE_REVISION = "20261114-corporate";

export function b2bProfilePdfHref(language: B2BLanguage, withCofounder = false): string {
  if (withCofounder) return "/sundaftrip-company-profile-billy.pdf";
  const suffix = language === "en" ? "" : `-${language}`;
  return `/sundaftrip-company-profile${suffix}.pdf?v=${B2B_PROFILE_REVISION}`;
}

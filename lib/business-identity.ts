export const TRIPADVISOR_PROFILE_URL =
  "https://www.tripadvisor.co.id/Attraction_Review-g1493703-d34552475-Reviews-Sundaf_Trip-Tangerang_Banten_Province_Java.html";

export const APPOINTMENT_ONLY_OFFICE_ADDRESS =
  "Kawasan Rasuna Epicentrum, Epiwalk Office Suite Lt. 5 Unit A501, Jl. HR Rasuna Said, Setiabudi, Jakarta Selatan, DKI Jakarta 12940";

export const APPOINTMENT_ONLY_LABEL = "Appointment only";

// The certificate QR opens this public AHU record; its registration details
// were matched with the issued certificate before publication.
export const SUNDAF_AHU_REGISTRATION = {
  legalName: "CV Sundaf Holiday Group",
  number: "AHU-0001183-AH.01.14 Tahun 2026",
  verificationUrl:
    "https://sab.ahu.go.id/cv/pendaftaran/info/no/AHU-0001183-AH.01.14+Tahun+2026/id/2785088",
} as const;

export function appointmentOnlyOfficeAddress(configuredAddress?: string) {
  const address = configuredAddress?.trim() || APPOINTMENT_ONLY_OFFICE_ADDRESS;

  return address
    .replace(/^office\s*\(\s*by\s+appointment\s+only\s*\)\s*/i, "")
    .replace(/^(?:by\s+)?appointment\s+only\s*[:,-]?\s*/i, "")
    .trim();
}

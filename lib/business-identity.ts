export const APPOINTMENT_ONLY_OFFICE_ADDRESS =
  "Kawasan Rasuna Epicentrum, Epiwalk Office Suite Lt. 5 Unit A501, Jl. HR Rasuna Said, Setiabudi, Jakarta Selatan, DKI Jakarta 12940";

export const APPOINTMENT_ONLY_LABEL = "Appointment only";

export function appointmentOnlyOfficeAddress(configuredAddress?: string) {
  const address = configuredAddress?.trim() || APPOINTMENT_ONLY_OFFICE_ADDRESS;

  return address
    .replace(/^office\s*\(\s*by\s+appointment\s+only\s*\)\s*/i, "")
    .replace(/^(?:by\s+)?appointment\s+only\s*[:,-]?\s*/i, "")
    .trim();
}

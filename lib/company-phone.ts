export const CURRENT_COMPANY_PHONE = "08111620207";

const RETIRED_COMPANY_PHONE_DIGITS = "02122321146";

function toIndonesianLocalDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0062")) {
    return `0${digits.slice(4).replace(/^0/, "")}`;
  }
  if (digits.startsWith("62")) {
    return `0${digits.slice(2).replace(/^0/, "")}`;
  }
  return digits;
}

export function resolveCompanyPhone(raw?: string | null) {
  const phone = raw?.trim() || "";
  if (!phone || toIndonesianLocalDigits(phone) === RETIRED_COMPANY_PHONE_DIGITS) {
    return CURRENT_COMPANY_PHONE;
  }
  return phone;
}

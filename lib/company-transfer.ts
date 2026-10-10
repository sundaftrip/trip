// Public receiving-account information for Sundaf Trip company transfers.
export const SUNDAF_TRANSFER_ACCOUNT = {
  bank: "BCA",
  number: "6815288673",
  holder: "CV SUNDAF HOLIDAY GROUP",
} as const;

export const SUNDAF_TRANSFER_INSTRUCTIONS = {
  id: `Transfer ke rekening perusahaan hanya melalui ${SUNDAF_TRANSFER_ACCOUNT.bank}, nomor rekening ${SUNDAF_TRANSFER_ACCOUNT.number}, atas nama ${SUNDAF_TRANSFER_ACCOUNT.holder}.`,
  en: `Company bank transfers are accepted only through ${SUNDAF_TRANSFER_ACCOUNT.bank}, account number ${SUNDAF_TRANSFER_ACCOUNT.number}, account holder ${SUNDAF_TRANSFER_ACCOUNT.holder}.`,
} as const;

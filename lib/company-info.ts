// Internal operational rows must never become editable CMS settings or public props.
export const INTERNAL_COMPANY_INFO_PREFIX = "__indexnow_";
export const publicCompanyInfoWhere: Prisma.CompanyInfoWhereInput = {
  NOT: { key: { startsWith: INTERNAL_COMPANY_INFO_PREFIX } },
};

export function isInternalCompanyInfoKey(key: string) {
  return key.toLowerCase().startsWith(INTERNAL_COMPANY_INFO_PREFIX);
}
import type { Prisma } from "@prisma/client";

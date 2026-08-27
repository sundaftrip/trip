import assert from "node:assert/strict";
import test from "node:test";
import { CURRENT_COMPANY_PHONE, resolveCompanyPhone } from "../lib/company-phone";

test("uses the current company phone when the setting is blank", () => {
  assert.equal(resolveCompanyPhone(), CURRENT_COMPANY_PHONE);
  assert.equal(resolveCompanyPhone("  "), CURRENT_COMPANY_PHONE);
});

test("replaces the retired landline in local and international formats", () => {
  assert.equal(resolveCompanyPhone("021-22321146"), CURRENT_COMPANY_PHONE);
  assert.equal(resolveCompanyPhone("+62 21 2232 1146"), CURRENT_COMPANY_PHONE);
  assert.equal(resolveCompanyPhone("+62 (0)21 2232 1146"), CURRENT_COMPANY_PHONE);
});

test("preserves a future configured phone number", () => {
  assert.equal(resolveCompanyPhone("+62 811 9999 0000"), "+62 811 9999 0000");
});

import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { isInternalCompanyInfoKey } from "../lib/company-info";

test("internal IndexNow names cannot be edited through settings, including case variants", () => {
  for (const key of ["__indexnow_url_abc", "__indexnow_cursor", "__INDEXNOW_LEASE"]) assert.equal(isInternalCompanyInfoKey(key), true);
  assert.equal(isInternalCompanyInfoKey("company_name"), false);
  const settings = fs.readFileSync(path.join(process.cwd(), "app/api/settings/route.ts"), "utf8");
  assert.match(settings, /authenticated \? \{ where: publicCompanyInfoWhere \}/);
  assert.match(settings, /isInternalCompanyInfoKey\(item.key\)/);
  assert.ok(settings.indexOf("Object.keys(body).some(isInternalCompanyInfoKey)") < settings.indexOf("prisma.companyInfo.upsert"));
});

test("all non-queue CompanyInfo collection readers declare a key boundary", () => {
  const files = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : /\.[cm]?[jt]sx?$/.test(file) ? [file] : [];
  });
  for (const file of ["app", "components", "lib", "scripts"].flatMap(files)) {
    if (file === path.join("lib", "indexnow-server.ts")) continue;
    const source = fs.readFileSync(file, "utf8");
    const expression = /\.companyInfo\.findMany\(/g;
    for (const match of source.matchAll(expression)) {
      const start = match.index! + match[0].length;
      let depth = 1, end = start;
      for (; end < source.length && depth; end++) {
        if (source[end] === "(") depth++;
        if (source[end] === ")") depth--;
      }
      const args = source.slice(start, end - 1);
      assert.match(args, /where\s*:/, `${file} has an unbounded CompanyInfo read`);
      assert.match(args, /(?:key\s*:|publicCompanyInfoWhere|PUBLIC_SETTING_KEYS)/, `${file} lacks a CompanyInfo key boundary`);
    }
  }
});

test("cron is authenticated, dynamic, and scheduled separately from the scraper", () => {
  const route = fs.readFileSync("app/api/cron/indexnow/route.ts", "utf8");
  assert.ok(route.indexOf("isIndexNowCronAuthorized(req.headers") < route.indexOf("await drainIndexNowQueue"));
  assert.match(route, /export const dynamic = "force-dynamic"/);
  const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  assert.equal(config.crons.filter((cron: { path: string }) => cron.path === "/api/cron/indexnow").length, 1);
  assert.equal(config.crons.filter((cron: { path: string }) => cron.path === "/api/cron/daily-scrape").length, 1);
});

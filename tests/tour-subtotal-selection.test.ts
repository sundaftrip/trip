import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import { buildWhatsAppBookingHref } from "../lib/tour-commerce";
import { tourSubtotalLabel } from "../lib/tour-cost-disclosure";
import { applyOptionalServicesToDepartures } from "../lib/tour-optional-pricing";
import { formatCurrency } from "../lib/utils";

type Element = { type?: unknown; props?: Record<string, unknown> };

function elements(node: unknown): Element[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  const element = node as Element;
  return [element, ...elements(element.props?.children)];
}

function component(name: string, selection: Record<string, unknown>) {
  const source = readFileSync(new URL(`../components/website/clean/${name}.tsx`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const testModule = { exports: {} as { default?: (props: Record<string, unknown>) => unknown } };
  vm.runInNewContext(code, {
    module: testModule, exports: testModule.exports,
    require: (id: string) => {
      if (id === "react/jsx-runtime") return jsxRuntime;
      if (id === "@/lib/tour-commerce") return { buildWhatsAppBookingHref };
      if (id === "@/lib/tour-cost-disclosure") return { tourSubtotalLabel };
      if (id === "@/lib/tour-optional-pricing") return { applyOptionalServicesToDepartures };
      if (id === "@/lib/utils") return { formatCurrency };
      if (id.endsWith("TourRoomSelectionContext")) return { useTourRoomSelection: () => selection };
      return { __esModule: true, default: id.endsWith(".css") ? {} : id.split("/").at(-1) };
    },
  });
  return testModule.exports.default!;
}

test("actual booking surfaces keep amounts while captions reflect selected rather than merely available options", () => {
  for (const mandatory of [0, 2_500_000]) {
    for (const optional of [0, 1_600_000]) {
      const room = { code: "twin", label: "Twin", headlinePrice: 27_000_000, mandatoryTotalPrice: 27_000_000 + mandatory };
      const selection = {
        selectedRoom: room,
        setSelectedRoomCode: () => {},
        hasOptionalServices: true,
        optionalServicesTotal: optional,
        optionalServicesPreference: optional ? "Visa Rusia: Ya, perlu dibantu" : "Visa Rusia: Tidak",
      };
      const props = {
        roomPrices: [room], mandatoryAddOns: mandatory ? [{ name: "Bagasi domestik", price: mandatory }] : [],
        hasMandatoryAddOns: mandatory > 0,
        hasPrice: true, basePrice: room.headlinePrice, startingTotal: room.mandatoryTotalPrice,
        bookingPhone: "628123456789", phone: "628123456789", tourId: "test-tour", tourName: "Rusia Aurora",
        priceLabel: formatCurrency(room.mandatoryTotalPrice), priceCaption: tourSubtotalLabel(mandatory > 0),
        availabilityLabel: "Tersedia", bookingMode: "available", bookingDepartures: [], completedTourHref: "/tours",
        fallbackHref: "/contact", bookingWaHref: "/contact", departureLabel: "14 Januari 2027",
      };
      const expectedCaption = optional > 0 ? "Subtotal pilihan per orang" : mandatory > 0 ? "Subtotal paket + tambahan wajib" : "Harga paket";
      const expectedAmount = formatCurrency(room.mandatoryTotalPrice + optional);
      const panel = elements(component("TourRoomBookingPanel", selection)(props));
      const booking = panel.find((item) => item.type === "TourBookingExperience")!;
      assert.equal(booking.props?.priceCaption, expectedCaption);
      assert.equal(booking.props?.priceLabel, expectedAmount);
      assert.ok(panel.some((item) => item.type === "dt" && item.props?.children === expectedCaption));

      const sidebar = elements(component("TourRoomBookingSidebar", selection)(props));
      const cta = sidebar.find((item) => item.type === "TourBookingCTA")!;
      const sidebarMessage = new URL(String(cta.props?.waHref)).searchParams.get("text")!;
      assert.ok(sidebarMessage.includes(expectedCaption));
      assert.ok(sidebarMessage.includes(expectedAmount));

      const recovery = elements(component("TourRoomRecoveryLink", selection)(props));
      const recoveryMessage = new URL(String(recovery.find((item) => item.type === "a")?.props?.href)).searchParams.get("text")!;
      assert.ok(recoveryMessage.includes(expectedCaption));
      assert.ok(recoveryMessage.includes(expectedAmount));
      assert.equal(room.mandatoryTotalPrice, 27_000_000 + mandatory);
    }
  }
});

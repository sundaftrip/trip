import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/website/clean/CleanTourDetail.tsx", import.meta.url),
  "utf8",
);
const bookingSource = readFileSync(
  new URL("../components/website/clean/TourBookingExperience.tsx", import.meta.url),
  "utf8",
);
const roomBookingSource = readFileSync(
  new URL("../components/website/clean/TourRoomBookingPanel.tsx", import.meta.url),
  "utf8",
);
const roomSidebarSource = readFileSync(
  new URL("../components/website/clean/TourRoomBookingSidebar.tsx", import.meta.url),
  "utf8",
);
const roomSelectionSource = readFileSync(
  new URL("../components/website/clean/TourRoomSelectionContext.tsx", import.meta.url),
  "utf8",
);
const roomRecoverySource = readFileSync(
  new URL("../components/website/clean/TourRoomRecoveryLink.tsx", import.meta.url),
  "utf8",
);
const recommendedAddOnSource = readFileSync(
  new URL("../components/website/clean/TourRecommendedAddOnToggle.tsx", import.meta.url),
  "utf8",
);
const bookingSheetSource = readFileSync(
  new URL("../components/website/clean/TourBookingSheet.tsx", import.meta.url),
  "utf8",
);
const visaToggleSource = readFileSync(
  new URL("../components/website/clean/TourVisaServiceToggle.tsx", import.meta.url),
  "utf8",
);
const detailPageSource = readFileSync(
  new URL("../app/(website)/tours/[id]/page.tsx", import.meta.url),
  "utf8",
);
const interactiveStylesSource = readFileSync(
  new URL("../components/website/clean/TourDetailInteractive.module.css", import.meta.url),
  "utf8",
);
const cleanStylesSource = readFileSync(
  new URL("../components/website/clean/CleanSite.module.css", import.meta.url),
  "utf8",
);

test("shows visual highlights for every itinerary day", () => {
  assert.match(source, /const experienceItems = itinerary\.map\(/);
  assert.doesNotMatch(source, /const experienceItems = itinerary\.slice\(/);
});

test("renders the resolved image inside every itinerary day", () => {
  assert.match(source, /const dayImage = resolveItineraryDayImage\(item, index, heroImages\)/);
  assert.match(source, /className=\{styles\.detailDayImage\}/);
  assert.match(source, /Gambaran perjalanan Hari \$\{item\.day\}: \$\{dayTitle\}/);
});

test("does not repeat the hero gallery before the itinerary", () => {
  assert.doesNotMatch(source, /GalleryZoom/);
  assert.doesNotMatch(source, /id="galeri"/);
  assert.doesNotMatch(source, /Dokumentasi &amp; gambaran perjalanan/);
  assert.match(
    source,
    /completedTourHref=\{itinerary\.length > 0 \? "#itinerary" : "#ringkasan"\}/,
  );
  assert.doesNotMatch(bookingSource, /Lihat dokumentasi/);
  assert.match(bookingSource, /Lihat itinerary perjalanan/);
});

test("makes every room tier an accessible synchronized choice", () => {
  assert.match(roomBookingSource, /<fieldset className=\{styles\.detailRoomPriceGrid\}>/);
  assert.match(roomBookingSource, /<legend className=\{styles\.detailRoomPriceLegend\}>Pilih jumlah orang per kamar<\/legend>/);
  assert.match(roomBookingSource, /<label[\s\S]{0,180}data-selected=\{selected\}/);
  assert.match(roomBookingSource, /type="radio"/);
  assert.match(roomBookingSource, /checked=\{selected\}/);
  assert.match(roomBookingSource, /aria-label=\{`Pilih \$\{room\.label\}`\}/);
  assert.match(roomBookingSource, /onChange=\{\(\) => setSelectedRoomCode\(room\.code\)\}/);
  assert.match(roomBookingSource, /selectedRoom\?\.headlinePrice/);
  assert.match(roomBookingSource, /selectedRoom\?\.mandatoryTotalPrice/);
  assert.match(roomBookingSource, /selectedRoomValue=\{selectedRoom\?\.code\}/);
  assert.match(bookingSource, /const room = selectedRoomValue \?\? internalRoom/);
  assert.match(bookingSource, /onRoomChange \?\? setInternalRoom/);
  assert.doesNotMatch(roomBookingSource, /type="button"/);
  assert.doesNotMatch(roomBookingSource, /aria-pressed/);
  assert.doesNotMatch(roomBookingSource, /data-featured/);
});

test("keeps the main date card while grouping mobile option controls and hiding them on desktop", () => {
  assert.match(
    roomBookingSource,
    /\{hasOptionalServices && \([\s\S]*?className=\{interactiveStyles\.dateCardOptionControls\}[\s\S]*?role="group"[\s\S]*?aria-label="Tambahan opsional"[\s\S]*?<TourRecommendedAddOnToggle compact grouped \/>[\s\S]*?<TourVisaServiceToggle compact grouped \/>/,
  );
  assert.match(
    interactiveStylesSource,
    /\.dateCardOptionControls \{[\s\S]*?display: grid;[\s\S]*?border: 1px solid #cfdcdc;[\s\S]*?border-radius: 12px;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailRecommendedAddOn\[data-grouped="true"\] \{[\s\S]*?border: 0;[\s\S]*?background: transparent;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailVisaServices\[data-grouped="true"\] \{[\s\S]*?border: 0;[\s\S]*?background: transparent;/,
  );
  assert.match(recommendedAddOnSource, /data-grouped=\{grouped \|\| undefined\}/);
  assert.match(visaToggleSource, /data-grouped=\{grouped \|\| undefined\}/);
  assert.match(
    interactiveStylesSource,
    /@media \(min-width: 701px\) \{[\s\S]*?\.dateCardOptionControls \{\s*display: none;\s*\}/,
  );
  assert.doesNotMatch(
    interactiveStylesSource,
    /@media \(min-width: 701px\) \{[\s\S]*?\.dateGrid \{\s*display: none;\s*\}/,
  );
  assert.match(
    cleanStylesSource,
    /@media \(max-width: 700px\) \{[\s\S]*?\.detailBookingSidebar \{ display: none; \}/,
  );
});

test("keeps the selected room synchronized through every booking surface", () => {
  assert.match(source, /<TourRoomSelectionProvider/);
  assert.match(source, /roomPrices=\{roomPrices\}/);
  assert.match(source, /selectableAddOn=\{selectableAddOn\}/);
  assert.match(source, /visaOffers=\{visaOffers\}/);
  assert.match(roomSelectionSource, /selectedRoomCode/);
  assert.match(roomBookingSource, /useTourRoomSelection\(\)/);
  assert.match(roomSidebarSource, /useTourRoomSelection\(\)/);
  assert.match(roomSidebarSource, /selectedRoom\?\.headlinePrice \?\? basePrice/);
  assert.match(roomSidebarSource, /selectedRoom\?\.mandatoryTotalPrice \?\? startingTotal/);
  assert.match(roomSidebarSource, /buildWhatsAppBookingHref\(bookingPhone/);
  assert.match(roomSidebarSource, /roomPreference: selectedRoom\?\.label/);
  assert.match(source, /<TourRoomRecoveryLink/g);
  assert.equal(source.match(/<TourRoomRecoveryLink/g)?.length, 2);
  assert.match(roomRecoverySource, /useTourRoomSelection\(\)/);
  assert.match(roomRecoverySource, /selectedRoom\?\.mandatoryTotalPrice/);
  assert.match(roomRecoverySource, /roomPreference: selectedRoom\?\.label/);
});

test("keeps recommended travel insurance optional and synchronized", () => {
  assert.match(source, /item\.tag === "recommended"/);
  assert.match(source, /asuransi perjalanan usia sampai 69 tahun/i);
  assert.match(source, /disclosureOptionalAddOns = getVisibleOptionalAddOns/);
  assert.match(roomSelectionSource, /useState\(false\)/);
  assert.match(roomSelectionSource, /includeSelectableAddOn && selectableAddOn/);
  assert.match(recommendedAddOnSource, /type="checkbox"/);
  assert.match(recommendedAddOnSource, /checked=\{includeSelectableAddOn\}/);
  assert.match(recommendedAddOnSource, /setIncludeSelectableAddOn\(event\.target\.checked\)/);
  assert.match(recommendedAddOnSource, /DIREKOMENDASIKAN/);
  assert.match(recommendedAddOnSource, /Termasuk/);
  assert.match(recommendedAddOnSource, /Tidak termasuk/);
  assert.doesNotMatch(recommendedAddOnSource, /type="button"/);
  assert.match(recommendedAddOnSource, /flat = false/);
  assert.match(recommendedAddOnSource, /data-flat=\{\(flat && !compact && !grouped\) \|\| undefined\}/);
  assert.match(bookingSheetSource, /<TourRecommendedAddOnToggle flat \/>/);
  assert.match(
    cleanStylesSource,
    /\.detailRecommendedAddOn\[data-flat="true"\] \{[\s\S]*?padding: 0;[\s\S]*?border: 0;[\s\S]*?border-radius: 0;[\s\S]*?background: transparent;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailRecommendedAddOn\[data-flat="true"\]\[data-included="true"\] \{[\s\S]*?background: transparent;/,
  );
  assert.match(roomBookingSource, /selectedMandatoryTotalPrice \+ optionalServicesTotal/);
  assert.match(roomSidebarSource, /selectedMandatoryTotalPrice \+ optionalServicesTotal/);
  assert.match(roomRecoverySource, /\(selectedRoom\?\.mandatoryTotalPrice \?\? startingTotal\) \+ optionalServicesTotal/);
  assert.match(bookingSource, /addOnPreference/);
  assert.match(bookingSource, /\|\| selectedDeparture\?\.priceLabel/);
  assert.match(bookingSheetSource, /\|\| selectedDeparture\?\.priceLabel/);
  assert.doesNotMatch(bookingSource, /addOnPreference \? priceLabel/);
  assert.doesNotMatch(bookingSheetSource, /addOnPreference \? priceLabel/);
  assert.match(roomBookingSource, /applyOptionalServicesToDepartures\(/);
  assert.match(roomBookingSource, /bookingDepartures,\s*optionalServicesTotal/);
  assert.match(roomBookingSource, /departures=\{pricedBookingDepartures\}/);
  assert.match(source, /priceValue: hasPrice \? \(startingTotal \|\| basePrice\) : undefined/);
  assert.match(roomSidebarSource, /selectedRoom \|\| hasOptionalServices/);
  assert.match(roomRecoverySource, /selectedRoom\?\.mandatoryTotalPrice \?\? startingTotal/);
});

test("offers only the visas required by the selected trip and keeps them optional", () => {
  assert.match(detailPageSource, /resolveTourVisaOffers\(\{/);
  assert.match(detailPageSource, /servicePrice: true/);
  assert.match(detailPageSource, /variants: \{/);
  assert.match(detailPageSource, /visaOffers=\{visaOffers\}/);
  assert.match(roomSelectionSource, /includedVisaOfferIds/);
  assert.match(roomSelectionSource, /optionalServicesTotal = selectableAddOnTotal;/);
  assert.doesNotMatch(visaToggleSource, /Perjalanan ini membutuhkan visa\./);
  assert.match(visaToggleSource, /negara tujuan, masa berlaku, dan jumlah masuk/);
  assert.match(visaToggleSource, /type="checkbox"/);
  assert.match(visaToggleSource, /included \? "Ya" : "Tidak"/);
  assert.match(visaToggleSource, /flat = false/);
  assert.match(visaToggleSource, /data-flat=\{\(flat && !compact && !grouped\) \|\| undefined\}/);
  assert.match(roomBookingSource, /<TourVisaServiceToggle compact grouped \/>/);
  assert.match(roomSidebarSource, /<TourVisaServiceToggle compact \/>/);
  assert.match(bookingSheetSource, /<TourVisaServiceToggle flat \/>/);
  assert.match(
    cleanStylesSource,
    /\.detailVisaServices\[data-flat="true"\] \{[\s\S]*?padding: 0;[\s\S]*?border: 0;[\s\S]*?border-radius: 0;[\s\S]*?background: transparent;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailVisaServices\[data-flat="true"\] \.detailVisaServiceOption \{[\s\S]*?padding: 0;[\s\S]*?border: 0;[\s\S]*?border-radius: 0;[\s\S]*?background: transparent;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailVisaServices\[data-flat="true"\] \.detailVisaServicesIntro strong \{[\s\S]*?font-size: 14px;[\s\S]*?font-weight: 700;[\s\S]*?line-height: 1\.4;/,
  );
  assert.match(
    cleanStylesSource,
    /\.detailRecommendedAddOn\[data-flat="true"\] \.detailRecommendedAddOnCopy strong \{[\s\S]*?font-size: 14px;[\s\S]*?font-weight: 700;[\s\S]*?line-height: 1\.4;/,
  );
  assert.match(
    interactiveStylesSource,
    /\.bookingSheet \{[\s\S]*?font-family: var\(--font-plus-jakarta\)[\s\S]*?font-weight: 400;[\s\S]*?letter-spacing: 0;/,
  );
});

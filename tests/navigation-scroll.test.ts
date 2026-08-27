import assert from "node:assert/strict";
import test from "node:test";

import {
  DESKTOP_SCROLL_RESET_MIN_WIDTH,
  isDesktopScrollResetViewport,
  resetDocumentScroll,
  shouldResetScrollForNavigation,
} from "../lib/navigation-scroll";

const current = "https://sundaftrip.com/tours/vietnam#ulasan";

test("resets scroll for internal navigation to another page", () => {
  assert.equal(shouldResetScrollForNavigation(current, "/visa"), true);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/jepang#harga-tanggal"), true);
});

test("preserves scroll for same-page tabs and catalog filters", () => {
  assert.equal(shouldResetScrollForNavigation(current, "#itinerary"), false);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/vietnam?bulan=oktober"), false);
  assert.equal(shouldResetScrollForNavigation(current, "/tours/vietnam/"), false);
});

test("ignores external and non-web navigation", () => {
  assert.equal(shouldResetScrollForNavigation(current, "https://example.com/visa"), false);
  assert.equal(shouldResetScrollForNavigation(current, "mailto:halo@sundaftrip.com"), false);
  assert.equal(shouldResetScrollForNavigation(current, "http://["), false);
});

test("does not force an immediate scroll reset on mobile navigation", () => {
  assert.equal(isDesktopScrollResetViewport(320), false);
  assert.equal(isDesktopScrollResetViewport(759), false);
  assert.equal(isDesktopScrollResetViewport(DESKTOP_SCROLL_RESET_MIN_WIDTH - 1), false);
});

test("keeps the existing immediate scroll reset on desktop navigation", () => {
  assert.equal(isDesktopScrollResetViewport(DESKTOP_SCROLL_RESET_MIN_WIDTH), true);
  assert.equal(isDesktopScrollResetViewport(1440), true);
});

function withMockScrollEnvironment(
  viewportWidth: number,
  run: (scrollCalls: ScrollToOptions[]) => void,
) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const scrollCalls: ScrollToOptions[] = [];
  const style = { scrollBehavior: "smooth" };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      innerWidth: viewportWidth,
      scrollTo(options: ScrollToOptions) {
        scrollCalls.push(options);
      },
      requestAnimationFrame(callback: FrameRequestCallback) {
        callback(0);
        return 1;
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: { style } },
  });

  try {
    run(scrollCalls);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
}

test("resetDocumentScroll leaves the mobile viewport untouched", () => {
  withMockScrollEnvironment(390, (scrollCalls) => {
    resetDocumentScroll();
    assert.deepEqual(scrollCalls, []);
  });
});

test("resetDocumentScroll keeps the desktop reset", () => {
  withMockScrollEnvironment(1440, (scrollCalls) => {
    resetDocumentScroll();
    assert.deepEqual(scrollCalls, [{ top: 0, left: 0, behavior: "auto" }]);
  });
});

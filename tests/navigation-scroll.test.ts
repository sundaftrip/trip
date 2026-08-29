import assert from "node:assert/strict";
import test from "node:test";

import {
  DESKTOP_SCROLL_RESET_MIN_WIDTH,
  isDesktopScrollResetViewport,
  resetDocumentScroll,
  resetDocumentScrollAfterNavigation,
  shouldScrollLinkToFragment,
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

test("keeps intentional fragment navigation while preserving ordinary routes", () => {
  assert.equal(shouldScrollLinkToFragment("/tours"), false);
  assert.equal(shouldScrollLinkToFragment("/?page=2#tours"), true);
  assert.equal(shouldScrollLinkToFragment("#contact"), true);
  assert.equal(shouldScrollLinkToFragment({ pathname: "/", hash: "tours" }), true);
  assert.equal(shouldScrollLinkToFragment({ pathname: "/tours" }), false);
});

test("does not force an immediate scroll reset on mobile navigation", () => {
  assert.equal(isDesktopScrollResetViewport(320), false);
  assert.equal(isDesktopScrollResetViewport(759), false);
  assert.equal(isDesktopScrollResetViewport(DESKTOP_SCROLL_RESET_MIN_WIDTH - 1), false);
  assert.equal(isDesktopScrollResetViewport(1024, {
    coarsePointer: true,
    finePointer: false,
    hover: false,
    maxTouchPoints: 5,
  }), false);
  assert.equal(isDesktopScrollResetViewport(1366, {
    coarsePointer: true,
    finePointer: false,
    hover: false,
    maxTouchPoints: 5,
  }), false);
  assert.equal(isDesktopScrollResetViewport(1440, {
    coarsePointer: false,
    finePointer: true,
    hover: true,
    maxTouchPoints: 5,
  }), false);
});

test("keeps the existing immediate scroll reset on desktop navigation", () => {
  const desktopCapabilities = {
    coarsePointer: false,
    finePointer: true,
    hover: true,
    maxTouchPoints: 0,
  };
  assert.equal(isDesktopScrollResetViewport(DESKTOP_SCROLL_RESET_MIN_WIDTH, desktopCapabilities), true);
  assert.equal(isDesktopScrollResetViewport(1440, desktopCapabilities), true);
});

function withMockScrollEnvironment(
  {
    viewportWidth,
    coarsePointer = false,
    finePointer = true,
    hover = true,
    maxTouchPoints = 0,
  }: {
    viewportWidth: number;
    coarsePointer?: boolean;
    finePointer?: boolean;
    hover?: boolean;
    maxTouchPoints?: number;
  },
  run: (scrollState: {
    root: { scrollBehavior: string };
    body: { scrollBehavior: string };
    scrollingElement: { scrollTop: number; scrollLeft: number };
    scrollCalls: ScrollToOptions[];
  }) => void,
) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const scrollCalls: ScrollToOptions[] = [];
  const rootStyle = { scrollBehavior: "smooth" };
  const bodyStyle = { scrollBehavior: "smooth" };
  const scrollingElement = { scrollTop: 480, scrollLeft: 24 };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      innerWidth: viewportWidth,
      matchMedia(query: string) {
        return {
          matches:
            (query === "(pointer: coarse)" && coarsePointer)
            || (query === "(pointer: fine)" && finePointer)
            || (query === "(hover: hover)" && hover),
        };
      },
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
    value: {
      documentElement: { style: rootStyle },
      body: { style: bodyStyle },
      scrollingElement,
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { maxTouchPoints },
  });

  try {
    run({
      root: rootStyle,
      body: bodyStyle,
      scrollingElement,
      scrollCalls,
    });
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
}

test("resetDocumentScroll leaves the mobile viewport untouched", () => {
  withMockScrollEnvironment({
    viewportWidth: 390,
    coarsePointer: true,
    finePointer: false,
    hover: false,
    maxTouchPoints: 5,
  }, ({ scrollingElement, scrollCalls }) => {
    resetDocumentScroll();
    assert.equal(scrollingElement.scrollTop, 480);
    assert.equal(scrollingElement.scrollLeft, 24);
    assert.deepEqual(scrollCalls, []);
  });
});

test("resetDocumentScrollAfterNavigation starts the mobile destination at the top", () => {
  withMockScrollEnvironment({
    viewportWidth: 390,
    coarsePointer: true,
    finePointer: false,
    hover: false,
    maxTouchPoints: 5,
  }, ({ root, body, scrollingElement, scrollCalls }) => {
    resetDocumentScrollAfterNavigation();
    assert.equal(scrollingElement.scrollTop, 0);
    assert.equal(scrollingElement.scrollLeft, 0);
    assert.equal(root.scrollBehavior, "smooth");
    assert.equal(body.scrollBehavior, "smooth");
    assert.deepEqual(scrollCalls, []);
  });
});

test("resetDocumentScroll leaves a 1024px touch tablet untouched", () => {
  withMockScrollEnvironment({
    viewportWidth: 1024,
    coarsePointer: true,
    finePointer: false,
    hover: false,
    maxTouchPoints: 5,
  }, ({ scrollingElement, scrollCalls }) => {
    resetDocumentScroll();
    assert.equal(scrollingElement.scrollTop, 480);
    assert.equal(scrollingElement.scrollLeft, 24);
    assert.deepEqual(scrollCalls, []);
  });
});

test("resetDocumentScroll keeps the desktop reset", () => {
  withMockScrollEnvironment({ viewportWidth: 1440 }, ({ root, body, scrollingElement, scrollCalls }) => {
    resetDocumentScroll();
    assert.equal(scrollingElement.scrollTop, 0);
    assert.equal(scrollingElement.scrollLeft, 0);
    assert.equal(root.scrollBehavior, "smooth");
    assert.equal(body.scrollBehavior, "smooth");
    assert.deepEqual(scrollCalls, []);
  });
});

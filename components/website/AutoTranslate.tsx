"use client";

import { useEffect } from "react";
import {
  normalizeEnglishTranslation,
  reviewedEnglishFor,
} from "@/lib/reviewed-english-copy";

type SiteLanguage = "id" | "en";
type TranslationStatus = "idle" | "loading" | "ready" | "error";
type TranslatableAttribute = "alt" | "aria-label" | "placeholder" | "title";

type TranslationState = {
  source: string;
  rendered?: string;
};

type TranslationTarget =
  | { kind: "text"; node: Text; state: TranslationState }
  | {
      kind: "attribute";
      element: HTMLElement;
      attribute: TranslatableAttribute;
      state: TranslationState;
    };

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
  "SVG",
  "PATH",
  "BLOCKQUOTE",
]);
const STOP = new Set([
  "SUNDAF",
  "Sundaf",
  "Sundaf Trip",
  "KOL.ID",
  "WhatsApp",
  "EN",
  "ID",
  "IN",
]);
const TRANSLATABLE_ATTRIBUTES: TranslatableAttribute[] = [
  "alt",
  "aria-label",
  "placeholder",
  "title",
];
const TRANSLATE_BATCH_SIZE = 45;
const CLIENT_CACHE_LIMIT = 1_500;
const CLIENT_CACHE_KEY = "tcache_en_v2";
const INITIAL_ENGLISH_DELAY_MS = 1_000;
const hasLetters = (value: string) => /[A-Za-zÀ-ÿ]/.test(value);

const memCache = new Map<string, string>();
const textStates = new WeakMap<Text, TranslationState>();
const attributeStates = new WeakMap<HTMLElement, Map<TranslatableAttribute, TranslationState>>();
let applying = false;

function readLanguage(): SiteLanguage {
  try {
    return localStorage.getItem("lang") === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

function loadClientCache() {
  try {
    const raw = localStorage.getItem(CLIENT_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
    Object.entries(parsed).forEach(([source, translation]) => {
      if (typeof translation === "string") memCache.set(source, translation);
    });
  } catch {
    // A missing or invalid browser cache must not block the page.
  }
}

function saveClientCache() {
  try {
    const entries = Array.from(memCache.entries()).slice(-CLIENT_CACHE_LIMIT);
    localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Translation still works for this visit when localStorage is unavailable.
  }
}

function isProtected(element: HTMLElement | null): boolean {
  let current = element;
  while (current) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    if (current.hasAttribute("data-no-translate")) return true;
    if (current.getAttribute("translate") === "no") return true;
    if (current.isContentEditable) return true;
    current = current.parentElement;
  }
  return false;
}

function isTranslatable(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 2 && hasLetters(trimmed) && !STOP.has(trimmed);
}

function textState(node: Text): TranslationState {
  const current = node.nodeValue ?? "";
  const existing = textStates.get(node);
  if (!existing) {
    const state = { source: current };
    textStates.set(node, state);
    return state;
  }

  if (existing.rendered !== undefined && current === existing.rendered) return existing;
  if (current !== existing.source) {
    existing.source = current;
    existing.rendered = undefined;
  }
  return existing;
}

function attributeState(
  element: HTMLElement,
  attribute: TranslatableAttribute,
): TranslationState | null {
  const current = element.getAttribute(attribute);
  if (current === null) return null;

  let states = attributeStates.get(element);
  if (!states) {
    states = new Map();
    attributeStates.set(element, states);
  }

  const existing = states.get(attribute);
  if (!existing) {
    const state = { source: current };
    states.set(attribute, state);
    return state;
  }

  if (existing.rendered !== undefined && current === existing.rendered) return existing;
  if (current !== existing.source) {
    existing.source = current;
    existing.rendered = undefined;
  }
  return existing;
}

function collectTargets(): TranslationTarget[] {
  const targets: TranslationTarget[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(candidate) {
      const node = candidate as Text;
      if (!isTranslatable(node.nodeValue ?? "")) return NodeFilter.FILTER_REJECT;
      if (isProtected(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current: Node | null;
  while ((current = walker.nextNode())) {
    const node = current as Text;
    targets.push({ kind: "text", node, state: textState(node) });
  }

  const selector = TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
  document.body.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (isProtected(element)) return;
    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const state = attributeState(element, attribute);
      if (!state || !isTranslatable(state.source)) return;
      targets.push({ kind: "attribute", element, attribute, state });
    });
  });

  return targets;
}

function sourceKey(target: TranslationTarget): string {
  return target.state.source.trim();
}

function translatedText(source: string, translation: string): string {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translation}${trailing}`;
}

function applyTranslation(target: TranslationTarget, translation: string) {
  const rendered = target.kind === "text"
    ? translatedText(target.state.source, translation)
    : translation;

  if (target.kind === "text") {
    if ((target.node.nodeValue ?? "") === rendered) {
      target.state.rendered = rendered;
      return;
    }
    applying = true;
    target.node.nodeValue = rendered;
    target.state.rendered = rendered;
    applying = false;
    return;
  }

  if (target.element.getAttribute(target.attribute) === rendered) {
    target.state.rendered = rendered;
    return;
  }
  applying = true;
  target.element.setAttribute(target.attribute, rendered);
  target.state.rendered = rendered;
  applying = false;
}

function translationFor(source: string): string | undefined {
  const translation = reviewedEnglishFor(source) ?? memCache.get(source);
  return translation === undefined ? undefined : normalizeEnglishTranslation(translation);
}

function setTranslationStatus(status: TranslationStatus) {
  document.documentElement.dataset.translationStatus = status;
  window.dispatchEvent(
    new CustomEvent("sundaf:translationstatus", { detail: { status } }),
  );
}

async function translatePage(signal: AbortSignal) {
  const targets = collectTargets();
  if (targets.length === 0) return;

  const pendingBySource = new Map<string, TranslationTarget[]>();
  targets.forEach((target) => {
    const source = sourceKey(target);
    const translation = translationFor(source);
    if (translation !== undefined) {
      applyTranslation(target, translation);
      return;
    }
    const pending = pendingBySource.get(source) ?? [];
    pending.push(target);
    pendingBySource.set(source, pending);
  });

  const sources = Array.from(pendingBySource.keys());
  for (let index = 0; index < sources.length; index += TRANSLATE_BATCH_SIZE) {
    if (signal.aborted) return;
    const batch = sources.slice(index, index + TRANSLATE_BATCH_SIZE);
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch, target: "en" }),
      signal,
    });
    if (!response.ok) throw new Error(`Translation failed: ${response.status}`);

    const data = (await response.json()) as {
      translations?: Record<string, unknown>;
      failures?: unknown;
    };
    const translations = data.translations ?? {};
    batch.forEach((source) => {
      const rawTranslation = translations[source];
      if (typeof rawTranslation !== "string" || !rawTranslation.trim()) return;
      const translation = normalizeEnglishTranslation(rawTranslation);
      memCache.set(source, translation);
      pendingBySource.get(source)?.forEach((target) => {
        const targetNode = target.kind === "text" ? target.node : target.element;
        if (!signal.aborted && document.contains(targetNode)) {
          applyTranslation(target, translation);
        }
      });
    });
    if (Array.isArray(data.failures) && data.failures.length > 0) {
      throw new Error("Some page copy could not be translated");
    }
  }

  saveClientCache();
}

function restorePage() {
  applying = true;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const node = current as Text;
    const state = textStates.get(node);
    if (state && node.nodeValue !== state.source) node.nodeValue = state.source;
  }

  const selector = TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
  document.body.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    const states = attributeStates.get(element);
    states?.forEach((state, attribute) => {
      if (element.getAttribute(attribute) !== state.source) {
        element.setAttribute(attribute, state.source);
      }
    });
  });

  applying = false;
}

function markOriginalQuotes() {
  document.querySelectorAll<HTMLElement>("blockquote").forEach((quote) => {
    if (!quote.hasAttribute("lang")) quote.setAttribute("lang", "id");
    if (!quote.hasAttribute("translate")) quote.setAttribute("translate", "no");
  });
}

export default function AutoTranslate() {
  useEffect(() => {
    loadClientCache();
    let language = readLanguage();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    let initialRun: ReturnType<typeof setTimeout> | null = null;
    let waitingForInitialEnglish = language === "en";
    let request: AbortController | null = null;

    const run = () => {
      request?.abort();
      request = null;
      document.documentElement.lang = language;
      document.documentElement.dataset.siteLanguage = language;
      markOriginalQuotes();

      if (language === "id") {
        restorePage();
        setTranslationStatus("idle");
        return;
      }

      request = new AbortController();
      const activeRequest = request;
      setTranslationStatus("loading");
      void translatePage(activeRequest.signal)
        .then(() => {
          if (!activeRequest.signal.aborted) setTranslationStatus("ready");
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (activeRequest.signal.aborted) return;

          language = "id";
          try {
            localStorage.setItem("lang", "id");
          } catch {
            // The page can still return to Indonesian without persistence.
          }
          restorePage();
          document.documentElement.lang = "id";
          document.documentElement.dataset.siteLanguage = "id";
          window.dispatchEvent(new CustomEvent("sundaf:langchange", {
            detail: { lang: "id" },
          }));
          setTranslationStatus("error");
        });
    };

    const schedule = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 250);
    };

    const observer = new MutationObserver((mutations) => {
      if (applying || waitingForInitialEnglish || language !== "en") return;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          schedule();
          return;
        }
        if (mutation.type === "characterData") {
          const node = mutation.target as Text;
          const state = textStates.get(node);
          if (state?.rendered !== undefined && node.nodeValue === state.rendered) {
            continue;
          }
          schedule();
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const onLanguageChange = () => {
      const next = readLanguage();
      if (next === language) return;
      if (initialRun) {
        clearTimeout(initialRun);
        initialRun = null;
      }
      waitingForInitialEnglish = false;
      language = next;
      run();
    };
    window.addEventListener("sundaf:langchange", onLanguageChange);
    window.addEventListener("storage", onLanguageChange);

    if (waitingForInitialEnglish) {
      setTranslationStatus("loading");
      initialRun = setTimeout(() => {
        initialRun = null;
        waitingForInitialEnglish = false;
        run();
      }, INITIAL_ENGLISH_DELAY_MS);
    } else {
      run();
    }

    return () => {
      observer.disconnect();
      request?.abort();
      window.removeEventListener("sundaf:langchange", onLanguageChange);
      window.removeEventListener("storage", onLanguageChange);
      if (debounce) clearTimeout(debounce);
      if (initialRun) clearTimeout(initialRun);
    };
  }, []);

  return null;
}

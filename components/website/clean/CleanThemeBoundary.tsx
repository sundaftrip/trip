"use client";

import { useLayoutEffect } from "react";

export default function CleanThemeBoundary({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;

    function applyPublicTheme() {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }

    applyPublicTheme();
    const observer = new MutationObserver(() => {
      if (root.classList.contains("dark") || !root.classList.contains("light")) {
        applyPublicTheme();
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      root.style.removeProperty("color-scheme");
    };
  }, []);

  return <div className="public-site-shell">{children}</div>;
}

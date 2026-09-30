"use client";

import { useDictionary } from "@/hooks/useDictionary";

export function Footer() {
  const t = useDictionary();

  return (
    <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-muted">
      <p>{t.footer.madeBy}</p>
      <p className="mt-1">© {new Date().getFullYear()} Pico &amp; Pala</p>
    </footer>
  );
}

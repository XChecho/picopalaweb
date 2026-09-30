"use client";

import Image from "next/image";
import { useDictionary } from "@/hooks/useDictionary";
import { LOCALES } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

export function Navbar() {
  const t = useDictionary();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="flex items-center gap-2 font-black">
          <Image src="/images/logo.png" alt="" width={32} height={32} className="rounded-lg" />
          Pico &amp; Pala
        </a>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <a href="#how" className="hidden text-text-muted hover:text-text-main sm:block">
            {t.nav.how}
          </a>
          <a href="#modes" className="hidden text-text-muted hover:text-text-main sm:block">
            {t.nav.modes}
          </a>
          <a href="#waitlist" className="text-text-muted hover:text-text-main">
            {t.nav.download}
          </a>
          <div className="flex overflow-hidden rounded-full border border-border" role="group" aria-label="Language">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                className={`px-3 py-1 text-xs uppercase ${
                  locale === code ? "bg-main-rose text-text-main" : "text-text-muted hover:text-text-main"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

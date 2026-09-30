import { create } from "zustand";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface ILocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<ILocaleState>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    try {
      localStorage.setItem("appLanguage", locale);
    } catch {}
    set({ locale });
  },
}));

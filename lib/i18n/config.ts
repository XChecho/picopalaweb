import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import enLanding from "@/locales/en/landing.json";
import enAuth from "@/locales/en/auth.json";
import enHowToPlay from "@/locales/en/howToPlay.json";
import enPlayHub from "@/locales/en/playHub.json";
import enRecords from "@/locales/en/records.json";
import enArena from "@/locales/en/arena.json";
import enLegal from "@/locales/en/legal.json";
import esCommon from "@/locales/es/common.json";
import esLanding from "@/locales/es/landing.json";
import esAuth from "@/locales/es/auth.json";
import esHowToPlay from "@/locales/es/howToPlay.json";
import esPlayHub from "@/locales/es/playHub.json";
import esRecords from "@/locales/es/records.json";
import esArena from "@/locales/es/arena.json";
import esLegal from "@/locales/es/legal.json";
import ptCommon from "@/locales/pt/common.json";
import ptLanding from "@/locales/pt/landing.json";
import ptAuth from "@/locales/pt/auth.json";
import ptHowToPlay from "@/locales/pt/howToPlay.json";
import ptPlayHub from "@/locales/pt/playHub.json";
import ptRecords from "@/locales/pt/records.json";
import ptArena from "@/locales/pt/arena.json";
import ptLegal from "@/locales/pt/legal.json";

export const SUPPORTED_LANGUAGES = ["en", "es", "pt"] as const;
export type TLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: TLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "appLanguage";

export const LANGUAGE_LABELS: Record<TLanguage, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

export function isSupportedLanguage(value: string | null | undefined): value is TLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export const resources = {
  en: { common: enCommon, landing: enLanding, auth: enAuth, howToPlay: enHowToPlay, playHub: enPlayHub, records: enRecords, arena: enArena, legal: enLegal },
  es: { common: esCommon, landing: esLanding, auth: esAuth, howToPlay: esHowToPlay, playHub: esPlayHub, records: esRecords, arena: esArena, legal: esLegal },
  pt: { common: ptCommon, landing: ptLanding, auth: ptAuth, howToPlay: ptHowToPlay, playHub: ptPlayHub, records: ptRecords, arena: ptArena, legal: ptLegal },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: "common",
    ns: ["common", "landing", "auth", "howToPlay", "playHub", "records", "arena"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;

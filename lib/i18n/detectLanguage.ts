import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, isSupportedLanguage, type TLanguage } from "./config";

export function detectLanguage(): TLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(saved)) return saved;
  } catch {}

  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return isSupportedLanguage(browser) ? browser : DEFAULT_LANGUAGE;
}

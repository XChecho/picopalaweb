"use client";

import { dictionaries, type IDictionary } from "@/lib/i18n";
import { useLocaleStore } from "@/store/useLocaleStore";

export function useDictionary(): IDictionary {
  const locale = useLocaleStore((state) => state.locale);
  return dictionaries[locale];
}

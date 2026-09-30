"use client";

import { Languages, BarChart3, Timer, WifiOff } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";

const ICONS = [Timer, WifiOff, Languages, BarChart3];

export function Features() {
  const t = useDictionary();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="mb-10 text-center text-3xl font-black sm:text-4xl">{t.features.title}</h2>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.features.items.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <li key={item.title} className="text-center">
              <Icon aria-hidden className="mx-auto mb-3 text-main-rose" size={32} />
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-text-muted">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

"use client";

import { Bot, Globe, Users } from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";

const ICONS = [Bot, Users, Globe];
const GRADIENTS = [
  "from-main-red to-main-rose",
  "from-main-purple to-cian",
  "from-cian to-success",
];

export function Modes() {
  const t = useDictionary();

  return (
    <section id="modes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <h2 className="mb-10 text-center text-3xl font-black sm:text-4xl">{t.modes.title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {t.modes.items.map((mode, index) => {
          const Icon = ICONS[index];
          return (
            <article key={mode.name} className="relative rounded-2xl border border-border bg-surface p-6">
              <span
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${GRADIENTS[index]}`}
              >
                <Icon aria-hidden size={24} />
              </span>
              <h3 className="text-lg font-bold">{mode.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{mode.text}</p>
              {mode.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-surface-light px-3 py-1 text-xs font-bold text-gold">
                  {mode.badge}
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

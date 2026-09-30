"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useDictionary } from "@/hooks/useDictionary";

export function Hero() {
  const t = useDictionary();

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-32 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-main-rose/20 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-3xl"
      >
        <Image
          src="/images/logo.png"
          alt="Pico & Pala"
          width={144}
          height={144}
          priority
          className="mx-auto mb-6 rounded-3xl shadow-card-glow"
        />
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-cian">{t.hero.tagline}</p>
        <h1 className="bg-gradient-to-r from-main-red to-main-rose bg-clip-text text-5xl font-black text-transparent sm:text-7xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">{t.hero.subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#waitlist"
            className="rounded-full bg-gradient-to-r from-main-red to-main-rose px-8 py-3 font-bold shadow-card-glow transition hover:brightness-110"
          >
            {t.hero.cta}
          </a>
          <a
            href="#how"
            className="rounded-full border border-border px-8 py-3 font-bold text-text-main transition hover:bg-surface"
          >
            {t.hero.secondary}
          </a>
        </div>
      </motion.div>
    </section>
  );
}

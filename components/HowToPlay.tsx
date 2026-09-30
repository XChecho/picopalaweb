"use client";

import { useDictionary } from "@/hooks/useDictionary";

const SECRET = "3719";
const GUESS = "3159";

function isPico(index: number): boolean {
  return SECRET[index] === GUESS[index];
}

function isPala(index: number): boolean {
  return !isPico(index) && SECRET.includes(GUESS[index]);
}

export function HowToPlay() {
  const t = useDictionary();
  const picos = GUESS.split("").filter((_, i) => isPico(i)).length;
  const palas = GUESS.split("").filter((_, i) => isPala(i)).length;

  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
      <h2 className="mb-10 text-center text-3xl font-black sm:text-4xl">{t.how.title}</h2>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.how.steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-main-purple to-cian font-black">
              {index + 1}
            </span>
            <h3 className="font-bold">{step.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-border bg-surface p-6">
        <h3 className="mb-4 text-center font-bold text-gold">{t.how.exampleTitle}</h3>
        <dl className="space-y-3">
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">{t.how.secret}</dt>
            <dd className="font-mono text-2xl font-black tracking-[0.4em]">{SECRET}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">{t.how.guess}</dt>
            <dd className="flex gap-1">
              {GUESS.split("").map((digit, i) => (
                <span
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-xl font-black ${
                    isPico(i)
                      ? "bg-success text-background"
                      : isPala(i)
                        ? "bg-gold text-background"
                        : "bg-surface-light"
                  }`}
                >
                  {digit}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <dt className="text-text-muted">{t.how.result}</dt>
            <dd className="font-bold">
              <span className="text-success">{picos} Picos</span> ·{" "}
              <span className="text-gold">{palas} Pala</span>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-text-muted">
          <span className="text-success">■</span> {t.how.pico}
          <br />
          <span className="text-gold">■</span> {t.how.pala}
        </p>
      </div>
    </section>
  );
}

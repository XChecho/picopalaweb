"use client";

import { useState, type FormEvent } from "react";
import { useDictionary } from "@/hooks/useDictionary";
import { useWaitlist } from "@/hooks/useWaitlist";

export function Waitlist() {
  const t = useDictionary();
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, isError } = useWaitlist();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate(email.trim());
  };

  return (
    <section id="waitlist" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-surface p-8 text-center shadow-card-glow">
        <h2 className="text-3xl font-black">{t.waitlist.title}</h2>
        <p className="mt-2 text-text-muted">{t.waitlist.text}</p>
        {isSuccess ? (
          <p role="status" className="mt-6 font-bold text-success">
            {t.waitlist.success}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="waitlist-email" className="sr-only">
              Email
            </label>
            <input
              id="waitlist-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.waitlist.placeholder}
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 outline-none focus:border-main-rose"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-gradient-to-r from-main-red to-main-rose px-6 py-3 font-bold transition hover:brightness-110 disabled:opacity-60"
            >
              {isPending ? t.waitlist.sending : t.waitlist.button}
            </button>
          </form>
        )}
        {isError && (
          <p role="alert" className="mt-4 text-sm text-error">
            {t.waitlist.error}
          </p>
        )}
      </div>
    </section>
  );
}

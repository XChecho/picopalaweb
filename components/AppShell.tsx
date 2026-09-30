"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAppNavigation, viewFromPathname } from "@/hooks/useAppNavigation";
import { useAppStore } from "@/store/useAppStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { navigate } = useAppNavigation();
  const lang = useAppStore((state) => state.lang);
  const setLang = useAppStore((state) => state.setLang);
  const soundEnabled = useAppStore((state) => state.audioSettings.soundEffects);
  const toggleSound = useAppStore((state) => state.toggleSound);
  const hasActiveMatch = useAppStore((state) => state.hasActiveMatch);

  return (
    <div className="min-h-screen bg-[#111319] text-[#e2e2ea] flex flex-col font-['Cairo',sans-serif]">
      <Header
        currentView={viewFromPathname(pathname)}
        onNavigate={navigate}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        lang={lang}
        onChangeLang={setLang}
        activeMatchInProgress={hasActiveMatch}
      />
      <main className="flex-1 w-full pt-20 flex flex-col">{children}</main>
      <Footer onNavigate={navigate} lang={lang} />
    </div>
  );
}

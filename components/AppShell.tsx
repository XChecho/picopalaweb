"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAppNavigation, viewFromPathname } from "@/hooks/useAppNavigation";
import { useLogout } from "@/hooks/useLogout";
import { useSession } from "@/hooks/useSession";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { navigate, resumeMatch } = useAppNavigation();
  const lang = useAppStore((state) => state.lang);
  const setLang = useAppStore((state) => state.setLang);
  const hasActiveMatch = useAppStore((state) => state.hasActiveMatch);
  const player = useAuthStore((state) => state.player);
  const authStatus = useAuthStore((state) => state.status);
  const logout = useLogout();

  useSession();

  // The arena fills the viewport on its own; a footer below it would add a second page scroll.
  const isArena = pathname === "/arena";

  return (
    <div className="min-h-dvh bg-[#111319] text-[#e2e2ea] flex flex-col font-['Cairo',sans-serif]">
      <Header
        currentView={viewFromPathname(pathname)}
        onNavigate={navigate}
        onResumeMatch={resumeMatch}
        lang={lang}
        onChangeLang={setLang}
        activeMatchInProgress={hasActiveMatch}
        player={player}
        authStatus={authStatus}
        onLogout={() => logout.mutate()}
        isLoggingOut={logout.isPending}
      />
      <main className="flex-1 w-full pt-20 flex flex-col">{children}</main>
      {!isArena && <Footer onNavigate={navigate} />}
    </div>
  );
}

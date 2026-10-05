"use client";

import { LandingView } from "@/components/views/LandingView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function LandingPage() {
  const { navigate, startMatch } = useAppNavigation();

  return (
    <LandingView
      onNavigate={navigate}
      onLaunchMatch={(mode) =>
        mode === "ai" ? navigate("play-hub") : startMatch(mode, "grandmaster")
      }
    />
  );
}

"use client";

import { LandingView } from "@/components/views/LandingView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function LandingPage() {
  const { navigate } = useAppNavigation();

  return <LandingView onNavigate={navigate} onLaunchMatch={() => navigate("play-hub")} />;
}

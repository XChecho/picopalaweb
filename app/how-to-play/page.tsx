"use client";

import { HowToPlayView } from "@/components/views/HowToPlayView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function HowToPlayPage() {
  const { navigate } = useAppNavigation();

  return <HowToPlayView onNavigate={navigate} />;
}

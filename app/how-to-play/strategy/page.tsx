"use client";

import { StrategyView } from "@/components/views/StrategyView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function StrategyPage() {
  const { navigate } = useAppNavigation();

  return <StrategyView onNavigate={navigate} />;
}

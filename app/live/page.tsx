"use client";

import { LiveView } from "@/components/views/LiveView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function LivePage() {
  const { navigate } = useAppNavigation();

  return <LiveView onNavigate={navigate} />;
}

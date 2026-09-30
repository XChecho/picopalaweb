"use client";

import { AuthView } from "@/components/views/AuthView";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export default function AuthPage() {
  const { navigate } = useAppNavigation();

  return <AuthView onNavigate={navigate} />;
}

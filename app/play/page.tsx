"use client";

import { PlayHubView } from "@/components/views/PlayHubView";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAppStore } from "@/store/useAppStore";

export default function PlayPage() {
  const { startMatch, resumeMatch } = useAppNavigation();
  const hasActiveMatch = useAppStore((state) => state.hasActiveMatch);

  return (
    <PlayHubView
      onStartMatch={startMatch}
      onResumeMatch={resumeMatch}
      hasActiveMatch={hasActiveMatch}
    />
  );
}

"use client";

import { RecordsView } from "@/components/views/RecordsView";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAppStore } from "@/store/useAppStore";

export default function RecordsPage() {
  const { navigate } = useAppNavigation();
  const audioSettings = useAppStore((state) => state.audioSettings);
  const updateAudio = useAppStore((state) => state.updateAudio);

  return (
    <RecordsView
      onNavigate={navigate}
      audioSettings={audioSettings}
      onUpdateAudio={updateAudio}
    />
  );
}

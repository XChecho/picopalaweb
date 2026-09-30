import { create } from "zustand";
import type { AudioSettings, Difficulty, GameMode } from "@/types/game";
import { soundEngine } from "@/lib/audio";

interface IAppState {
  matchMode: GameMode;
  matchDifficulty: Difficulty;
  hasActiveMatch: boolean;
  lang: string;
  audioSettings: AudioSettings;
  startMatch: (mode: GameMode, difficulty?: Difficulty) => void;
  setMatchActive: (active: boolean) => void;
  finishMatch: () => void;
  setLang: (lang: string) => void;
  toggleSound: () => void;
  updateAudio: (key: keyof AudioSettings, value: boolean) => void;
}

export const useAppStore = create<IAppState>((set) => ({
  matchMode: "ai",
  matchDifficulty: "grandmaster",
  hasActiveMatch: false,
  lang: "en",
  audioSettings: {
    soundEffects: true,
    matchAmbientMusic: false,
    hapticFeedback: true,
    turnAlerts: true,
  },
  startMatch: (mode, difficulty) =>
    set((state) => ({
      matchMode: mode,
      matchDifficulty: difficulty ?? state.matchDifficulty,
    })),
  setMatchActive: (active) => set({ hasActiveMatch: active }),
  finishMatch: () => set({ hasActiveMatch: false }),
  setLang: (lang) => set({ lang }),
  toggleSound: () =>
    set((state) => {
      const soundEffects = !state.audioSettings.soundEffects;
      soundEngine.enabled = soundEffects;
      return { audioSettings: { ...state.audioSettings, soundEffects } };
    }),
  updateAudio: (key, value) =>
    set((state) => {
      if (key === "soundEffects") soundEngine.enabled = value;
      return { audioSettings: { ...state.audioSettings, [key]: value } };
    }),
}));

import { create } from "zustand";
import type { IPlayer, TAuthStatus } from "@/types/auth";

interface IAuthState {
  player: IPlayer | null;
  status: TAuthStatus;
  setPlayer: (player: IPlayer) => void;
  setAnonymous: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
  player: null,
  status: "unknown",
  setPlayer: (player) => set({ player, status: "authenticated" }),
  setAnonymous: () => set({ player: null, status: "anonymous" }),
}));

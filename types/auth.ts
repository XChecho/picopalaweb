export type TApiLanguage = "EN" | "ES" | "PT";
export type TRank = "BRONCE" | "PLATA" | "ORO" | "PLATINO" | "DIAMANTE";

export interface IPlayer {
  id: string;
  username: string;
  email: string;
  language: TApiLanguage;
  avatarUrl: string | null;
  elo: number;
  rank: TRank;
  createdAt: string;
}

export interface ISessionResponse {
  player: IPlayer | null;
}

export interface ILoginPayload {
  username: string;
  password: string;
}

export interface IRegisterPayload {
  username: string;
  email: string;
  password: string;
  language?: "en" | "es" | "pt";
  /** Turnstile token (single use). Omitted only when no site key is configured (dev). */
  captchaToken?: string;
}

export type TAuthStatus = "unknown" | "authenticated" | "anonymous";

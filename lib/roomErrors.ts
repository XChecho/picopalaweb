import { ApiError } from "@/lib/api";

/** Maps a failed room/match request to a key of the `room` i18n namespace (`errors.*`). */
export function roomErrorKey(error: unknown): string {
  if (!(error instanceof ApiError)) return "errors.generic";
  if (error.status === 0) return "errors.network";
  const message = error.message.toLowerCase();
  if (error.status === 404) return "errors.notFound";
  if (message.includes("own room")) return "errors.own";
  if (message.includes("expired")) return "errors.expired";
  if (message.includes("full")) return "errors.full";
  if (message.includes("not your turn")) return "errors.notYourTurn";
  return "errors.generic";
}

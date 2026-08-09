import { BACKEND_WS_ORIGIN } from "../lib/config";
import { useSocket } from "./useSocket";

/** Streams every new click across all of the current user's links. */
export function useMyClicksSocket(token: string | null, onMessage: (raw: string) => void): boolean {
  const url = token ? `${BACKEND_WS_ORIGIN}/ws/me?token=${token}` : null;
  return useSocket(url, onMessage);
}

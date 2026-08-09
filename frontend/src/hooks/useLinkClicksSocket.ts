import { BACKEND_WS_ORIGIN } from "../lib/config";
import { useSocket } from "./useSocket";

export function useLinkClicksSocket(
  shortCode: string | undefined,
  token: string | null,
  onMessage: (raw: string) => void
): boolean {
  const url = shortCode && token ? `${BACKEND_WS_ORIGIN}/ws/links/${shortCode}?token=${token}` : null;
  return useSocket(url, onMessage);
}

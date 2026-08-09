import { useEffect, useRef, useState } from "react";
import { BACKEND_WS_ORIGIN } from "../lib/config";

export function useLinkClicksSocket(
  shortCode: string | undefined,
  token: string | null,
  onMessage: (raw: string) => void
): boolean {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!shortCode || !token) return;

    const ws = new WebSocket(`${BACKEND_WS_ORIGIN}/ws/links/${shortCode}?token=${token}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => onMessageRef.current(event.data);

    return () => ws.close();
  }, [shortCode, token]);

  return connected;
}

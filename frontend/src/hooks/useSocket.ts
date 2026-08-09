import { useEffect, useRef, useState } from "react";

/** Opens a WebSocket at `url` (no-op while null) and reports connection state. */
export function useSocket(url: string | null, onMessage: (raw: string) => void): boolean {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => onMessageRef.current(event.data);

    return () => ws.close();
  }, [url]);

  return connected;
}

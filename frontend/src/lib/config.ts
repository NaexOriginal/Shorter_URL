// The redirect endpoint (GET /{code}) lives on the backend directly, not
// behind the /api proxy, so shareable short links need an absolute URL.
export const BACKEND_ORIGIN: string =
  import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:8000";

// The WebSocket endpoint also lives on the backend directly (ws:// mirrors
// whatever scheme BACKEND_ORIGIN uses, http -> ws / https -> wss).
export const BACKEND_WS_ORIGIN: string = BACKEND_ORIGIN.replace(/^http/, "ws");

// The redirect endpoint (GET /{code}) lives on the backend directly, not
// behind the /api proxy, so shareable short links need an absolute URL.
export const BACKEND_ORIGIN: string =
  import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:8000";

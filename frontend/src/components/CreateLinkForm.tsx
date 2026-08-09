import { useState, type FormEvent } from "react";
import { ApiError, createLink } from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Link } from "../types/link";

function isLikelyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CreateLinkForm({ onCreated }: { onCreated: (link: Link) => void }) {
  const { token } = useAuth();
  const [targetUrl, setTargetUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!targetUrl) {
      setError("Ingresá una URL para acortar");
      return;
    }
    if (!isLikelyUrl(targetUrl)) {
      setError("Ingresá una URL válida (debe empezar con http:// o https://)");
      return;
    }

    setIsSubmitting(true);
    try {
      const link = await createLink(token!, targetUrl);
      onCreated(link);
      setTargetUrl("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? "No se pudo crear el link: " + err.message
          : "No se pudo crear el link. Intentá de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        inputMode="url"
        placeholder="https://tu-sitio.com/pagina-muy-larga"
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 text-sm font-medium whitespace-nowrap"
      >
        {isSubmitting ? "Creando..." : "Acortar link"}
      </button>
      {error && <p className="sm:basis-full text-sm text-red-400">{error}</p>}
    </form>
  );
}

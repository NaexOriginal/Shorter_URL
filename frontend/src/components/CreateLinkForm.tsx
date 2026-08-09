import { useState, type FormEvent } from "react";
import { ApiError, createLink } from "../lib/api";
import { useAuth } from "../context/useAuth";
import type { Link } from "../types/link";

const CUSTOM_SLUG_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
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
    if (customSlug && !CUSTOM_SLUG_PATTERN.test(customSlug)) {
      setError("El alias debe tener 3-32 caracteres: letras, números, guiones o guiones bajos");
      return;
    }

    setIsSubmitting(true);
    try {
      const link = await createLink(token!, targetUrl, customSlug || undefined);
      onCreated(link);
      setTargetUrl("");
      setCustomSlug("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Ese alias ya está en uso, probá con otro"
          : err instanceof ApiError
            ? "No se pudo crear el link: " + err.message
            : "No se pudo crear el link. Intentá de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((current) => !current)}
        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        {showAdvanced ? "− Ocultar opciones avanzadas" : "+ Opciones avanzadas"}
      </button>

      {showAdvanced && (
        <div>
          <label htmlFor="customSlug" className="block text-sm text-slate-300 mb-1">
            Alias personalizado (opcional)
          </label>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-slate-500 whitespace-nowrap">/</span>
            <input
              id="customSlug"
              type="text"
              placeholder="mi-marca"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Si lo dejás vacío, se genera uno aleatorio. 3-32 caracteres, sin espacios.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}

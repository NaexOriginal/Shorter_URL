import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinkQrCode } from "../components/LinkQrCode";
import { useToast } from "../context/useToast";
import { BACKEND_ORIGIN } from "../lib/config";
import type { Link } from "../types/link";

export function CreateLinkPage() {
  const [created, setCreated] = useState<Link | null>(null);
  const { showToast } = useToast();

  if (created) {
    const shortUrl = `${BACKEND_ORIGIN}/${created.short_code}`;

    const handleCopy = async () => {
      await navigator.clipboard.writeText(shortUrl);
      showToast("Enlace copiado al portapapeles");
    };

    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">¡Link creado!</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col items-center gap-4 text-center">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-medium break-all"
          >
            {shortUrl}
          </a>
          <p className="text-slate-500 text-sm truncate max-w-full" title={created.target_url}>
            {created.target_url}
          </p>

          <LinkQrCode value={shortUrl} fileName={created.short_code} />

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="text-sm rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 transition-colors"
            >
              Copiar link
            </button>
            <button
              onClick={() => setCreated(null)}
              className="text-sm rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 transition-colors"
            >
              Crear otro
            </button>
            <RouterLink
              to="/dashboard/links"
              className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5"
            >
              Ver mis links
            </RouterLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Crear link</h1>
      <CreateLinkForm onCreated={setCreated} />
    </div>
  );
}

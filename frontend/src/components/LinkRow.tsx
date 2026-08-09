import { useState } from "react";
import { BACKEND_ORIGIN } from "../lib/config";
import type { Link } from "../types/link";

export function LinkRow({ link }: { link: Link }) {
  const [copied, setCopied] = useState(false);
  const shortUrl = `${BACKEND_ORIGIN}/${link.short_code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <li className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 px-4 border border-slate-800 rounded-lg bg-slate-900">
      <div className="flex-1 min-w-0">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-400 hover:text-indigo-300 font-medium text-sm break-all"
        >
          {shortUrl}
        </a>
        <p className="text-slate-500 text-xs truncate mt-0.5" title={link.target_url}>
          {link.target_url}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-slate-400 bg-slate-800 rounded-full px-2.5 py-1">
          {link.click_count} {link.click_count === 1 ? "clic" : "clics"}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs rounded-lg border border-slate-700 px-2.5 py-1.5 hover:bg-slate-800 transition-colors"
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
    </li>
  );
}

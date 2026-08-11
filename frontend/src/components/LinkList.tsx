import { Link as RouterLink } from "react-router-dom";
import { LinkRow } from "./LinkRow";
import type { Link } from "../types/link";

function EmptyLinksState() {
  return (
    <div className="flex flex-col items-center gap-3 text-center py-16">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-slate-700"
      >
        <path
          d="M10 14a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 5.5M14 10a5 5 0 0 0-7.07 0L4.1 12.83a5 5 0 0 0 7.07 7.07L12.5 18.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-slate-500 text-sm">Todavía no tenés links</p>
      <RouterLink
        to="/dashboard/create"
        className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5"
      >
        Crear tu primer link
      </RouterLink>
    </div>
  );
}

export function LinkList({ links }: { links: Link[] }) {
  if (links.length === 0) {
    return <EmptyLinksState />;
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <LinkRow key={link.id} link={link} />
      ))}
    </ul>
  );
}

import { LinkRow } from "./LinkRow";
import type { Link } from "../types/link";

export function LinkList({ links }: { links: Link[] }) {
  if (links.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-10">
        Todavía no tenés links. Creá el primero arriba.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <LinkRow key={link.id} link={link} />
      ))}
    </ul>
  );
}

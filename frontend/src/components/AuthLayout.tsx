import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}

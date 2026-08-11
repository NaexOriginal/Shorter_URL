import { useToast } from "../context/useToast";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none sm:bottom-6 sm:items-end sm:right-6 sm:left-auto sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 shadow-lg animate-toast-in"
        >
          <span className="text-emerald-400">✓</span>
          {toast.message}
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Cerrar notificación"
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

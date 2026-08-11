import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { ApiError, deleteAccount, updateEmail, updatePassword } from "../lib/api";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.status === 401) return "Contraseña incorrecta";
  if (err instanceof ApiError && err.status === 409) return "Ese email ya está en uso";
  if (err instanceof ApiError) return err.message;
  return fallback;
}

function EmailSection() {
  const { user, token, refreshSession } = useAuth();
  const { showToast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { access_token } = await updateEmail(token!, currentPassword, newEmail);
      await refreshSession(access_token);
      setNewEmail("");
      setCurrentPassword("");
      showToast("Email actualizado");
    } catch (err) {
      setError(errorMessage(err, "No se pudo actualizar el email"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
      <div>
        <h2 className="text-sm font-medium text-slate-200">Email</h2>
        <p className="text-xs text-slate-500 mt-0.5">Actual: {user?.email}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <div>
          <label htmlFor="newEmail" className="block text-sm text-slate-300 mb-1">
            Nuevo email
          </label>
          <input
            id="newEmail"
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="emailPassword" className="block text-sm text-slate-300 mb-1">
            Contraseña actual
          </label>
          <input
            id="emailPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 text-sm font-medium"
        >
          {isSubmitting ? "Guardando..." : "Actualizar email"}
        </button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(token!, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      showToast("Contraseña actualizada");
    } catch (err) {
      setError(errorMessage(err, "No se pudo actualizar la contraseña"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 space-y-3">
      <h2 className="text-sm font-medium text-slate-200">Contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <div>
          <label htmlFor="currentPassword" className="block text-sm text-slate-300 mb-1">
            Contraseña actual
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm text-slate-300 mb-1">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 text-sm font-medium"
        >
          {isSubmitting ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
    </section>
  );
}

function DeleteAccountSection() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteAccount(token!, currentPassword);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "No se pudo eliminar la cuenta"));
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 sm:p-5 space-y-3">
      <div>
        <h2 className="text-sm font-medium text-red-300">Eliminar cuenta</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Esta acción borra tu cuenta y todos tus links de forma permanente. No se puede deshacer.
        </p>
      </div>

      {!isConfirming ? (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="text-sm rounded-lg border border-red-800 text-red-300 px-3 py-1.5 hover:bg-red-900/30 transition-colors"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
          <div>
            <label htmlFor="deletePassword" className="block text-sm text-slate-300 mb-1">
              Confirmá tu contraseña para continuar
            </label>
            <input
              id="deletePassword"
              type="password"
              required
              autoFocus
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-sm rounded-lg bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-3 py-1.5"
            >
              {isSubmitting ? "Eliminando..." : "Confirmar eliminación"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsConfirming(false);
                setCurrentPassword("");
                setError(null);
              }}
              className="text-sm rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ajustes</h1>
      <EmailSection />
      <PasswordSection />
      <DeleteAccountSection />
    </div>
  );
}

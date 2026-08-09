import { useNavigate } from "react-router-dom";
import { CreateLinkForm } from "../components/CreateLinkForm";

export function CreateLinkPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-lg font-semibold">Crear link</h1>
      <CreateLinkForm onCreated={() => navigate("/dashboard/links")} />
    </div>
  );
}

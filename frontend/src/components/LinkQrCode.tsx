import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export function LinkQrCode({ value, fileName }: { value: string; fileName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${fileName}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-lg">
        <QRCodeCanvas ref={canvasRef} value={value} size={160} marginSize={0} />
      </div>
      <button
        type="button"
        onClick={handleDownload}
        className="text-xs rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 transition-colors"
      >
        Descargar QR
      </button>
    </div>
  );
}

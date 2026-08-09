const numberFormatter = new Intl.NumberFormat("es-AR");
const compactFormatter = new Intl.NumberFormat("es-AR", { notation: "compact" });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompactNumber(value: number): string {
  return value >= 100_000 ? compactFormatter.format(value) : numberFormatter.format(value);
}

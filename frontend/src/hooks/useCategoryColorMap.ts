import { useRef } from "react";

// Dark-mode categorical slots, validated (see the dataviz skill's
// palette.md + validate_palette.js) against this app's #1a1a19 chart
// surface. Fixed order, never cycled per-render.
const CATEGORICAL_DARK = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
];

/**
 * Assigns each label a color the first time it's seen and never reassigns
 * it afterwards — so live-updating charts don't repaint a category just
 * because its rank shifted (color follows the entity, not its rank).
 */
export function useCategoryColorMap(labels: string[]): Map<string, string> {
  const mapRef = useRef(new Map<string, string>());
  for (const label of labels) {
    if (!mapRef.current.has(label)) {
      const nextIndex = mapRef.current.size % CATEGORICAL_DARK.length;
      mapRef.current.set(label, CATEGORICAL_DARK[nextIndex]);
    }
  }
  return mapRef.current;
}

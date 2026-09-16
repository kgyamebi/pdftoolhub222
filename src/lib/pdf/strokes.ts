export type StrokePoint = { x: number; y: number };
export type Stroke = { points: StrokePoint[] };

export function parseStrokes(raw: string): Stroke[] {
  if (!raw.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => {
        if (!item || typeof item !== "object" || !("points" in item)) return null;
        const points = (item as Stroke).points;
        if (!Array.isArray(points)) return null;
        const cleaned = points
          .map((p) => ({ x: Number(p?.x), y: Number(p?.y) }))
          .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
        return cleaned.length >= 2 ? { points: cleaned } : null;
      })
      .filter((s): s is Stroke => s != null);
  } catch {
    return [];
  }
}

export function stringifyStrokes(strokes: Stroke[]): string {
  return JSON.stringify(strokes);
}

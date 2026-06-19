/**
 * Build an SVG path string for a sparkline over `values`, normalized to fit a
 * `width` × `height` box (min at the bottom, max at the top). Returns "" when
 * there's nothing meaningful to draw.
 */
export function sparklinePath(
  values: number[],
  width: number,
  height: number,
): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

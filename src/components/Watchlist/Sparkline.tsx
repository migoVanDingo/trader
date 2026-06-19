import { sparklinePath } from "../../lib/sparkline";

const W = 64;
const H = 20;

/** Tiny inline SVG trend line, colored by net change over the window. */
export function Sparkline({ values }: { values: number[] | undefined }) {
  if (!values || values.length < 2) {
    return <span className="sparkline-placeholder" />;
  }
  const up = values[values.length - 1] >= values[0];
  return (
    <svg
      className={`sparkline ${up ? "up" : "down"}`}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={sparklinePath(values, W, H)} fill="none" strokeWidth={1.5} />
    </svg>
  );
}

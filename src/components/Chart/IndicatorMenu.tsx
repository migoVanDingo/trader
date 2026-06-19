import { useEffect, useRef, useState } from "react";
import { MA_PERIODS, maColor } from "../../lib/indicators";
import { useStore } from "../../state/store";

export function IndicatorMenu() {
  const { ma, showRSI, showVolume, toggleMA, toggleRSI, toggleVolume } =
    useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside the menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const activeCount = ma.length + (showRSI ? 1 : 0) + (showVolume ? 1 : 0);

  return (
    <div className="indicator-menu" ref={ref}>
      <button
        className={`indicator-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Indicators
        {activeCount > 0 && (
          <span className="indicator-count">{activeCount}</span>
        )}
        <span className="indicator-caret">▾</span>
      </button>

      {open && (
        <div className="indicator-panel" role="menu">
          <div className="indicator-group-label">Overlays</div>
          <Toggle checked={showVolume} onChange={toggleVolume} label="Volume" />
          {MA_PERIODS.map((p) => (
            <Toggle
              key={p}
              checked={ma.includes(p)}
              onChange={() => toggleMA(p)}
              label={`MA ${p}`}
              swatch={maColor(p)}
            />
          ))}

          <div className="indicator-group-label">Oscillators</div>
          <Toggle checked={showRSI} onChange={toggleRSI} label="RSI (14)" />
        </div>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  swatch,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  swatch?: string;
}) {
  return (
    <label className="indicator-item">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {swatch && (
        <span className="indicator-swatch" style={{ background: swatch }} />
      )}
      <span>{label}</span>
    </label>
  );
}

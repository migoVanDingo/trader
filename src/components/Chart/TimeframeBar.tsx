import { TIMEFRAMES } from "../../lib/timeframes";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function TimeframeBar({ value, onChange }: Props) {
  return (
    <div className="timeframe-bar" role="group" aria-label="Chart timeframe">
      {TIMEFRAMES.map((tf, i) => {
        // Visually separate candle-interval buttons from range presets.
        const showDivider =
          i > 0 &&
          tf.group === "range" &&
          TIMEFRAMES[i - 1].group === "interval";
        return (
          <span key={tf.id} className="timeframe-item">
            {showDivider && <span className="timeframe-divider" aria-hidden />}
            <button
              className={`timeframe-btn${tf.id === value ? " active" : ""}`}
              onClick={() => onChange(tf.id)}
              aria-pressed={tf.id === value}
            >
              {tf.label}
            </button>
          </span>
        );
      })}
    </div>
  );
}

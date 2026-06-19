import { useShallow } from "zustand/react/shallow";
import {
  MA_PERIODS,
  EMA_PERIODS,
  maColor,
  emaColor,
} from "../../lib/indicators";
import { useStore } from "../../state/store";
import { usePopover } from "../../hooks/usePopover";

export function IndicatorMenu() {
  const s = useStore(
    useShallow((st) => ({
      ma: st.ma,
      ema: st.ema,
      showBollinger: st.showBollinger,
      showVolume: st.showVolume,
      showVolumeMa: st.showVolumeMa,
      showRSI: st.showRSI,
      showMACD: st.showMACD,
      toggleMA: st.toggleMA,
      toggleEMA: st.toggleEMA,
      toggleBollinger: st.toggleBollinger,
      toggleVolume: st.toggleVolume,
      toggleVolumeMa: st.toggleVolumeMa,
      toggleRSI: st.toggleRSI,
      toggleMACD: st.toggleMACD,
    })),
  );
  const { open, setOpen, ref } = usePopover();

  const activeCount =
    s.ma.length +
    s.ema.length +
    (s.showBollinger ? 1 : 0) +
    (s.showVolume ? 1 : 0) +
    (s.showVolumeMa ? 1 : 0) +
    (s.showRSI ? 1 : 0) +
    (s.showMACD ? 1 : 0);

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
          <div className="indicator-group-label">Volume</div>
          <Toggle
            checked={s.showVolume}
            onChange={s.toggleVolume}
            label="Volume"
          />
          <Toggle
            checked={s.showVolumeMa}
            onChange={s.toggleVolumeMa}
            label="Volume MA (20)"
          />

          <div className="indicator-group-label">Moving averages</div>
          {MA_PERIODS.map((p) => (
            <Toggle
              key={`ma${p}`}
              checked={s.ma.includes(p)}
              onChange={() => s.toggleMA(p)}
              label={`SMA ${p}`}
              swatch={maColor(p)}
            />
          ))}
          {EMA_PERIODS.map((p) => (
            <Toggle
              key={`ema${p}`}
              checked={s.ema.includes(p)}
              onChange={() => s.toggleEMA(p)}
              label={`EMA ${p}`}
              swatch={emaColor(p)}
            />
          ))}
          <Toggle
            checked={s.showBollinger}
            onChange={s.toggleBollinger}
            label="Bollinger (20, 2)"
          />

          <div className="indicator-group-label">Oscillators</div>
          <Toggle checked={s.showRSI} onChange={s.toggleRSI} label="RSI (14)" />
          <Toggle
            checked={s.showMACD}
            onChange={s.toggleMACD}
            label="MACD (12, 26, 9)"
          />
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useMarkets } from "../hooks/useMarkets";
import { useStore } from "../state/store";
import { baseAsset } from "../lib/symbols";

const MAX_RESULTS = 60;

/** Searchable dropdown over all tradable USDT pairs; star toggles favorite. */
export function SymbolSearch() {
  const markets = useMarkets();
  const symbol = useStore((s) => s.symbol);
  const favorites = useStore((s) => s.favorites);
  const setSymbol = useStore((s) => s.setSymbol);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    const list = q
      ? markets.filter((m) => m.symbol.includes(q) || m.base.includes(q))
      : markets;
    return list.slice(0, MAX_RESULTS);
  }, [markets, query]);

  const select = (s: string) => {
    setSymbol(s);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="symbol-search" ref={ref}>
      <button
        className="symbol-search-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="symbol-search-base">{baseAsset(symbol)}</span>
        <span className="symbol-search-quote">/ USDT</span>
        <span className="symbol-search-caret">▾</span>
      </button>

      {open && (
        <div className="symbol-search-panel">
          <input
            ref={inputRef}
            className="symbol-search-input"
            placeholder="Search markets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "Enter" && results[0]) select(results[0].symbol);
            }}
          />
          <ul className="symbol-search-results">
            {results.length === 0 && (
              <li className="symbol-search-empty">No matches</li>
            )}
            {results.map((m) => {
              const fav = favorites.includes(m.symbol);
              return (
                <li key={m.symbol}>
                  <button
                    className={`symbol-search-row${m.symbol === symbol ? " active" : ""}`}
                    onClick={() => select(m.symbol)}
                  >
                    <span className="symbol-search-row-base">{m.base}</span>
                    <span className="symbol-search-row-quote">USDT</span>
                  </button>
                  <button
                    className={`symbol-search-star${fav ? " on" : ""}`}
                    onClick={() => toggleFavorite(m.symbol)}
                    aria-label={
                      fav ? "Remove from watchlist" : "Add to watchlist"
                    }
                    title={fav ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {fav ? "★" : "☆"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useState, type ReactNode } from "react";

export interface PanelTab {
  id: string;
  label: string;
  render: () => ReactNode;
}

interface Props {
  tabs: PanelTab[];
}

/** Collapsible right rail with tabs (Order Book, Trades, …). */
export function SidePanel({ tabs }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        className="side-panel-reopen"
        onClick={() => setCollapsed(false)}
        title="Show panel"
        aria-label="Show panel"
      >
        ‹
      </button>
    );
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <aside className="side-panel">
      <div className="side-panel-head">
        <div className="side-panel-tabs" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === active?.id}
              className={`side-panel-tab${t.id === active?.id ? " active" : ""}`}
              onClick={() => setActiveId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          className="side-panel-collapse"
          onClick={() => setCollapsed(true)}
          title="Hide panel"
          aria-label="Hide panel"
        >
          ›
        </button>
      </div>
      <div className="side-panel-body">{active?.render()}</div>
    </aside>
  );
}

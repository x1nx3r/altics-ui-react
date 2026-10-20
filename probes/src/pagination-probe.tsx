import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@altics/ui";
import "@altics/ui/styles.css";
import "../src/index.css";
import { Select, type SelectOption } from "../../src/components/select";

const PAGE_SIZE = 4;
const TOTAL_PAGES = 6;
const INITIAL_PAGES = 3;

const pageOf = (n: number): SelectOption[] =>
  Array.from({ length: PAGE_SIZE }, (_, i) => {
    const k = n * PAGE_SIZE + i + 1;
    return { value: `team-${k}`, label: `Team ${k}`, description: `t${k}` };
  });

declare global {
  interface Window {
    __snapshot: () => Record<string, unknown>;
  }
}

function Paginated() {
  const [options, setOptions] = useState<SelectOption[]>(() =>
    Array.from({ length: INITIAL_PAGES }, (_, n) => pageOf(n)).flat(),
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(INITIAL_PAGES - 1);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    const next = page + 1;
    setTimeout(() => {
      setOptions((prev) => [...prev, ...pageOf(next)]);
      setPage(next);
      setLoading(false);
      if (next >= TOTAL_PAGES - 1) setHasMore(false);
    }, 300);
  };

  window.__snapshot = () => {
    const rows = [...document.querySelectorAll('[role="option"]')].map((r) => r.textContent);
    const chips = [...document.querySelectorAll('[data-slot="tag"]')].map((c) => c.textContent);
    const panel = document.querySelector('[data-slot="popover"]');
    const input = document.querySelector('[data-slot="search"] input');
    return {
      rows: rows.length,
      firstRow: rows[0] ?? null,
      lastRow: rows[rows.length - 1] ?? null,
      chips,
      panelOpen: !!panel,
      sentinel: !!document.querySelector('[data-slot="load-more"]'),
      loadingRow: !!panel?.querySelector('[data-slot="loading"]'),
      focusInSearch: document.activeElement === input,
      rowsRect: rows.length
        ? (() => {
            const first = document
              .querySelectorAll('[role="option"]')[0]
              .getBoundingClientRect();
            const last = document
              .querySelectorAll('[role="option"]')[rows.length - 1]
              .getBoundingClientRect();
            return { firstY: Math.round(first.y), lastY: Math.round(last.y) };
          })()
        : null,
    };
  };

  return (
    <div style={{ padding: 40, width: 400 }}>
      <Select
        multiple
        searchable
        chips
        options={options}
        defaultValues={["team-14"]}
        loading={loading}
        onLoadMore={loadMore}
        hasMore={hasMore}
        placeholder="Teams"
        portalRoot={undefined}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <Paginated />
  </ThemeProvider>,
);

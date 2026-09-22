import type { ReactNode } from 'react';

/** A titled row, the showcase's convention: the measured value rides in the
 * title, so the story states its own sheet number. */
export function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold opacity-70">{title}</p>
      {children}
    </div>
  );
}

/** A column of titled rows. */
export function Rows({ children, className = 'space-y-6' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/** The base consumes chips the way TagsInput renders them: elements marked
 * `data-slot="tag"` in the leading slot. The overflow modes switch the region
 * to the chip inset, so they only read correctly with chips in the field. */
export const chip = (label: string) => (
  <span
    key={label}
    data-slot="tag"
    className="flex h-6 shrink-0 items-center rounded-sm border border-neutral-300 bg-background pr-1 pl-2.5"
  >
    <span className="truncate text-sm text-neutral-700">{label}</span>
  </span>
);

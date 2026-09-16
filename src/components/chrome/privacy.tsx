export function PrivacyPills({ compact = false }: { compact?: boolean }) {
  const items = [
    "Local processing",
    "No upload",
    "No account",
    "Auto-delete in 2 hours",
  ];
  return (
    <ul className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"} aria-label="Privacy guarantees">
      {items.map((item) => (
        <li
          key={item}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--trust)_28%,transparent)] bg-[color-mix(in_oklab,var(--trust)_8%,transparent)] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[color:var(--trust)] uppercase"
        >
          <span className="size-1.5 rounded-full bg-[color:var(--trust)]" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PrivacyRail({ local }: { local: boolean }) {
  return (
    <aside className="glass hairline rounded-2xl p-4">
      <p className="text-xs font-medium tracking-[0.16em] text-[color:var(--trust)] uppercase">Trust</p>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex gap-2">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[color:var(--trust)]" />
          {local ? "Processing stays in this browser." : "This tool waits for a configured provider — it will not fake a result."}
        </li>
        <li className="flex gap-2">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[color:var(--trust)]" />
          Workspace copies expire in about two hours.
        </li>
        <li className="flex gap-2">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[color:var(--trust)]" />
          No account required for core tools.
        </li>
      </ul>
    </aside>
  );
}

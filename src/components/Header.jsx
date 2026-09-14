function LocationMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__mark" aria-hidden="true">
          <LocationMark />
        </span>
        <span className="app-header__name">Location Access System</span>
      </div>

      <style>{`
        .app-header {
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
        }
        .app-header__inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .app-header__mark {
          display: inline-flex;
          color: var(--color-accent);
        }
        .app-header__name {
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-ink);
        }
      `}</style>
    </header>
  );
}

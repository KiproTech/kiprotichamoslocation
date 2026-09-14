const SHARED_ITEMS = [
  { icon: "📍", label: "Precise location" },
  { icon: "📏", label: "Location accuracy" },
  { icon: "📱", label: "Basic device information" },
  { icon: "🌐", label: "Browser information" },
  { icon: "🖥️", label: "Screen information" },
  { icon: "🌍", label: "Language and time zone" },
  { icon: "🕒", label: "Date and time of the visit" },
];

const PROTECTED_ITEMS = [
  "SMS",
  "Call history",
  "Contacts",
  "Passwords",
  "Private files",
  "IMEI",
  "Camera contents without permission",
  "Microphone contents without permission",
];

export default function ConsentCard({ isRequesting, onAllow, onCancel }) {
  return (
    <section className="consent-card" aria-labelledby="consent-title">
      <h1 id="consent-title" className="consent-card__title">
        Location &amp; Device Access
      </h1>

      <p className="consent-card__lead">
        This website can show you your current location on a map after
        your browser gives permission. Everything below is shown only to
        you, on this screen — it is never sent to a server, saved
        anywhere, or shared with anyone.
      </p>

      <div className="consent-card__block">
        <h2 className="consent-card__heading">What will be shown to you?</h2>
        <ul className="share-list">
          {SHARED_ITEMS.map((item) => (
            <li key={item.label} className="share-list__item">
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="consent-card__note">
          Only information available through normal browser APIs is used,
          and only to display it back to you. Nothing is accessed outside
          of what your browser explicitly permits.
        </p>
      </div>

      <div className="privacy-notice" role="note">
        <p className="privacy-notice__title">What this website cannot access</p>
        <p className="privacy-notice__text">
          A normal website has no way to reach protected phone data, such as{" "}
          {PROTECTED_ITEMS.join(", ")}, or your camera and microphone without
          separate, explicit permission.
        </p>
      </div>

      <div className="consent-card__actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={onAllow}
          disabled={isRequesting}
        >
          {isRequesting ? "Requesting location..." : "Allow & Continue"}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onCancel}
          disabled={isRequesting}
        >
          Cancel
        </button>
      </div>

      <p className="consent-card__https-note">
        Location access normally requires a secure context such as HTTPS.{" "}
        <code>localhost</code> can be used during development.
      </p>

      <style>{`
        .consent-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 28px 24px 26px;
        }

        .consent-card__title {
          margin: 0 0 12px;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: var(--color-ink);
        }

        .consent-card__lead {
          margin: 0 0 22px;
          color: var(--color-ink-soft);
          font-size: 0.98rem;
        }

        .consent-card__block {
          margin-bottom: 20px;
        }

        .consent-card__heading {
          margin: 0 0 10px;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-ink);
        }

        .share-list {
          list-style: none;
          margin: 0 0 10px;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 14px;
        }

        .share-list__item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.92rem;
          color: var(--color-ink-soft);
        }

        .consent-card__note {
          margin: 4px 0 0;
          font-size: 0.85rem;
          color: var(--color-ink-soft);
        }

        .privacy-notice {
          background: var(--color-caution-bg);
          border: 1px solid var(--color-caution-border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          margin-bottom: 24px;
        }

        .privacy-notice__title {
          margin: 0 0 6px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-caution);
        }

        .privacy-notice__text {
          margin: 0;
          font-size: 0.85rem;
          color: var(--color-ink-soft);
        }

        .consent-card__actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .consent-card__https-note {
          margin: 14px 0 0;
          font-size: 0.78rem;
          color: var(--color-ink-soft);
        }

        .consent-card__https-note code {
          background: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.78rem;
        }

        @media (max-width: 420px) {
          .share-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

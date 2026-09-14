import { Fragment, useState } from "react";

const FIELD_LABELS = [
  { key: "deviceLine", label: "Device" },
  { key: "browser", label: "Browser" },
  { key: "operatingSystem", label: "Operating System" },
  { key: "screenLine", label: "Screen" },
  { key: "language", label: "Language" },
  { key: "timezone", label: "Time Zone" },
  { key: "platform", label: "Platform" },
];

function isKnown(value) {
  return value !== undefined && value !== null && value !== "" && value !== "Unknown";
}

export default function DeviceInfo({ data }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!data) return null;

  const deviceLine =
    isKnown(data.deviceType) && isKnown(data.operatingSystem)
      ? `${data.operatingSystem} ${data.deviceType}`
      : data.deviceType;

  const screenLine =
    data.screenWidth && data.screenHeight
      ? `${data.screenWidth} × ${data.screenHeight}`
      : null;

  const rows = { ...data, deviceLine, screenLine };

  return (
    <div className="device-info">
      <p className="device-info__title">Device Information</p>
      <dl className="device-info__grid">
        {FIELD_LABELS.filter(({ key }) => isKnown(rows[key])).map(({ key, label }) => (
          <Fragment key={key}>
            <dt>{label}</dt>
            <dd>{rows[key]}</dd>
          </Fragment>
        ))}
      </dl>

      {isKnown(data.userAgent) && (
        <div className="device-info__advanced">
          <button
            type="button"
            className="device-info__toggle"
            onClick={() => setShowAdvanced((prev) => !prev)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? "Hide advanced details" : "Show advanced details"}
          </button>
          {showAdvanced && <p className="device-info__ua">{data.userAgent}</p>}
        </div>
      )}

      <style>{`
        .device-info {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
        }

        .device-info__title {
          margin: 0 0 10px;
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--color-ink);
        }

        .device-info__grid {
          margin: 0;
          display: grid;
          grid-template-columns: auto 1fr;
          column-gap: 12px;
          row-gap: 4px;
          font-size: 0.88rem;
        }

        .device-info__grid dt {
          color: var(--color-ink-soft);
        }

        .device-info__grid dd {
          margin: 0;
          color: var(--color-ink);
          word-break: break-word;
        }

        .device-info__advanced {
          margin-top: 12px;
          border-top: 1px solid var(--color-border);
          padding-top: 10px;
        }

        .device-info__toggle {
          background: none;
          border: none;
          padding: 0;
          color: var(--color-accent);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .device-info__ua {
          margin: 8px 0 0;
          font-size: 0.76rem;
          color: var(--color-ink-soft);
          word-break: break-all;
          background: var(--color-paper);
          border-radius: 6px;
          padding: 8px 10px;
        }
      `}</style>
    </div>
  );
}

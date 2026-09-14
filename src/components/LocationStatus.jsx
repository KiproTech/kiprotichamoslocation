import { LOCATION_ERROR } from "../services/locationService.js";
import { getFriendlyLocationMessage } from "../utils/locationMessages.js";
import { formatCoordinate, formatAccuracy, formatTimestamp } from "../utils/formatLocation.js";
import LocationMap from "./LocationMap.jsx";

function Spinner() {
  return (
    <span className="spinner" aria-hidden="true">
      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid var(--color-border);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spinner { animation-duration: 2.2s; }
        }
      `}</style>
    </span>
  );
}

export default function LocationStatus({ status, data, errorCode, onRetry, onRefresh }) {
  if (status === "idle") {
    return (
      <p className="location-status location-status--muted">
        Location permission has not been requested.
      </p>
    );
  }

  if (status === "requesting") {
    return (
      <p className="location-status location-status--pending" role="status">
        <Spinner /> Requesting your location...
        <style>{`
          .location-status--pending {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        `}</style>
      </p>
    );
  }

  if (status === "low-accuracy" && data) {
    return (
      <div className="location-status location-status--caution" role="alert">
        <p className="location-status__headline">Low Location Accuracy</p>
        <p className="location-status__text">
          Your device could not determine your location accurately enough
          (accuracy {formatAccuracy(data.accuracy)}).
        </p>
        <ul className="location-status__tips">
          <li>Enable GPS / precise location for this browser</li>
          <li>Move near a window or outdoors if possible</li>
          <li>Try again</li>
        </ul>
        {onRetry && (
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try Again
          </button>
        )}

        <style>{`
          .location-status--caution {
            background: var(--color-caution-bg);
            border: 1px solid var(--color-caution-border);
            border-radius: var(--radius-md);
            padding: 14px 16px;
          }
          .location-status--caution .location-status__headline {
            margin: 0 0 6px;
            font-weight: 600;
            color: var(--color-caution);
            font-size: 0.92rem;
          }
          .location-status--caution .location-status__text {
            margin: 0 0 10px;
            font-size: 0.88rem;
            color: var(--color-ink-soft);
          }
          .location-status__tips {
            margin: 0 0 14px;
            padding-left: 18px;
            font-size: 0.86rem;
            color: var(--color-ink-soft);
          }
          .location-status__tips li {
            margin-bottom: 4px;
          }
        `}</style>
      </div>
    );
  }

  if (status === "granted" && data) {
    return (
      <div className="location-status location-status--granted" role="status">
        <p className="location-status__headline">✓ Location found</p>
        <dl className="location-status__grid">
          <dt>Latitude</dt>
          <dd>{formatCoordinate(data.latitude)}</dd>

          <dt>Longitude</dt>
          <dd>{formatCoordinate(data.longitude)}</dd>

          <dt>Accuracy</dt>
          <dd>{formatAccuracy(data.accuracy)}</dd>

          <dt>Retrieved</dt>
          <dd>{formatTimestamp(data.timestamp)}</dd>
        </dl>

        <div className="location-status__map">
          <LocationMap location={data} />
        </div>

        <p className="location-status__disclosure">
          This location is shown only to you, in your browser. It is not
          sent anywhere or saved anywhere.
        </p>

        {onRefresh && (
          <button
            type="button"
            className="btn btn--secondary location-status__refresh"
            onClick={onRefresh}
          >
            Refresh Location
          </button>
        )}

        <style>{`
          .location-status--granted {
            background: #eef6ee;
            border: 1px solid #cfe6cf;
            border-radius: var(--radius-md);
            padding: 14px 16px;
          }
          .location-status__headline {
            margin: 0 0 10px;
            font-weight: 600;
            color: #1f6b2c;
            font-size: 0.92rem;
          }
          .location-status__grid {
            margin: 0;
            display: grid;
            grid-template-columns: auto 1fr;
            column-gap: 12px;
            row-gap: 4px;
            font-size: 0.88rem;
          }
          .location-status__grid dt {
            color: var(--color-ink-soft);
          }
          .location-status__grid dd {
            margin: 0;
            color: var(--color-ink);
            font-variant-numeric: tabular-nums;
          }
          .location-status__map {
            margin-top: 14px;
          }
          .location-status__disclosure {
            margin: 10px 0 0;
            font-size: 0.78rem;
            color: var(--color-ink-soft);
          }
          .location-status__refresh {
            margin-top: 12px;
          }
        `}</style>
      </div>
    );
  }

  if (status === "error") {
    const isDenied = errorCode === LOCATION_ERROR.PERMISSION_DENIED;
    return (
      <div className="location-status location-status--error" role="alert">
        <p className="location-status__headline">
          {isDenied ? "Location Permission Denied" : "Location Unavailable"}
        </p>
        <p className="location-status__text">{getFriendlyLocationMessage(errorCode)}</p>
        {onRetry && (
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try Again
          </button>
        )}

        <style>{`
          .location-status--error {
            background: #fdecea;
            border: 1px solid #f3c7c1;
            border-radius: var(--radius-md);
            padding: 14px 16px;
          }
          .location-status__headline {
            margin: 0 0 6px;
            font-weight: 600;
            color: var(--color-danger);
            font-size: 0.92rem;
          }
          .location-status__text {
            margin: 0 0 12px;
            font-size: 0.88rem;
            color: var(--color-ink-soft);
          }
        `}</style>
      </div>
    );
  }

  return null;
}

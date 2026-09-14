import { LOCATION_ERROR, isLowAccuracy } from "../services/locationService.js";
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

export default function LocationStatus({
  status,
  data,
  bestSoFar,
  errorCode,
  onRetry,
  onRefresh,
}) {
  if (status === "idle") {
    return (
      <p className="location-status location-status--muted">
        Location permission has not been requested.
      </p>
    );
  }

  if (status === "requesting") {
    const hasReading = bestSoFar && typeof bestSoFar.accuracy === "number";
    return (
      <p className="location-status location-status--pending" role="status">
        <Spinner />{" "}
        {hasReading ? (
          <>
            Improving location accuracy...
            <span className="location-status__best">
              {" "}
              Best accuracy: {formatAccuracy(bestSoFar.accuracy)}
            </span>
          </>
        ) : (
          "Getting your location..."
        )}
        <style>{`
          .location-status--pending {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
          }
          .location-status__best {
            color: var(--color-ink-soft);
            font-size: 0.85rem;
          }
        `}</style>
      </p>
    );
  }

  if (status === "granted" && data) {
    const lowAccuracy = isLowAccuracy(data);
    return (
      <div className="location-status location-status--granted" role="status">
        <p className="location-status__headline">✓ Location obtained</p>
        <dl className="location-status__grid">
          <dt>Latitude</dt>
          <dd>{formatCoordinate(data.latitude)}</dd>

          <dt>Longitude</dt>
          <dd>{formatCoordinate(data.longitude)}</dd>

          <dt>Best accuracy</dt>
          <dd>{formatAccuracy(data.accuracy)}</dd>

          <dt>Time received</dt>
          <dd>{formatTimestamp(data.timestamp)}</dd>
        </dl>

        {lowAccuracy && (
          <p className="location-status__warning" role="alert">
            Location accuracy is currently low. For better accuracy, try
            moving outdoors and ensure your phone's high-accuracy location
            setting is enabled.
          </p>
        )}

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
          .location-status__warning {
            margin: 10px 0 0;
            padding: 10px 12px;
            background: var(--color-caution-bg);
            border: 1px solid var(--color-caution-border);
            border-radius: var(--radius-sm, 6px);
            color: var(--color-caution);
            font-size: 0.85rem;
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

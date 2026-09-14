import { buildEmbedMapUrl, buildNavigationUrl } from "../utils/mapLinks.js";

// Shows the current visitor's own location on an embedded map and offers
// a link to open it in a full maps/navigation app. This component only
// ever renders in the visitor's own browser — the coordinates never
// leave the page except as a normal map-tile request to the map
// provider (the same thing every map on every website does) and, if the
// visitor chooses to click through, to open their own location in Maps.
export default function LocationMap({ location }) {
  if (!location) return null;

  const embedUrl = buildEmbedMapUrl(location);
  const navigationUrl = buildNavigationUrl(location);

  return (
    <div className="location-map">
      {embedUrl && (
        <div className="location-map__frame">
          <iframe
            title="Your current location"
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {navigationUrl && (
        <a
          className="btn btn--secondary location-map__link"
          href={navigationUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open My Location in Maps
        </a>
      )}

      <style>{`
        .location-map {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .location-map__frame {
          position: relative;
          width: 100%;
          padding-top: 62%;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-border);
          background: var(--color-paper);
        }

        .location-map__frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .location-map__link {
          text-align: center;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

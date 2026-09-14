import { useEffect, useRef, useState } from "react";
import Header from "../components/Header.jsx";
import ConsentCard from "../components/ConsentCard.jsx";
import LocationStatus from "../components/LocationStatus.jsx";
import DeviceInfo from "../components/DeviceInfo.jsx";
import { getCurrentLocation, LOCATION_ERROR } from "../services/locationService.js";
import { getDeviceInfo } from "../services/deviceInfo.js";
import { getSessionId } from "../services/sessionService.js";

// status: "idle" | "cancelled" | "requesting" | "granted" | "error"
//
// Everything on this page lives in React state only, for the current
// browser tab. Nothing is sent to a server, saved to storage, or shared
// with anyone else — the visitor is the only person who ever sees this
// data. A location's real accuracy is always shown as reported; a low
// value just adds an inline advisory (see LocationStatus) instead of
// hiding the result.
export default function VisitorPage() {
  const [status, setStatus] = useState("idle");
  const [visitorData, setVisitorData] = useState(null);
  const [bestSoFar, setBestSoFar] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Holds the cancel() for whichever location request is currently in
  // flight, so we can stop watchPosition early on unmount, when consent
  // is withdrawn, or when a new request supersedes an old one.
  const cancelActiveRequestRef = useRef(null);

  useEffect(() => {
    // Component unmount: make sure any in-progress watchPosition is torn
    // down rather than left running in the background.
    return () => {
      cancelActiveRequestRef.current?.();
      cancelActiveRequestRef.current = null;
    };
  }, []);

  function requestLocation() {
    // Stop any previous in-flight watch before starting a new one.
    cancelActiveRequestRef.current?.();

    setStatus("requesting");
    setErrorCode(null);
    setBestSoFar(null);

    const { promise, cancel } = getCurrentLocation({
      onProgress: (reading) => setBestSoFar(reading),
    });
    cancelActiveRequestRef.current = cancel;

    promise
      .then((location) => {
        cancelActiveRequestRef.current = null;
        const device = getDeviceInfo();

        // Combined object for this visit, kept in memory only. Nothing
        // here is sent to a server, saved to Supabase, or shared with
        // anyone — it exists only to render on this screen.
        const combined = {
          sessionId: getSessionId(),
          location,
          device,
        };

        setVisitorData(combined);
        setStatus("granted");
      })
      .catch((error) => {
        cancelActiveRequestRef.current = null;
        setErrorCode(error.code || LOCATION_ERROR.UNKNOWN);
        setStatus("error");
      });
  }

  function handleAllow() {
    requestLocation();
  }

  function handleCancel() {
    cancelActiveRequestRef.current?.();
    cancelActiveRequestRef.current = null;
    setStatus("cancelled");
    setVisitorData(null);
    setErrorCode(null);
  }

  function handleRetry() {
    requestLocation();
  }

  function handleRefresh() {
    requestLocation();
  }

  return (
    <div className="visitor-page">
      <Header />
      <main className="visitor-page__main">
        <div className="visitor-page__card">
          <ConsentCard
            isRequesting={status === "requesting"}
            onAllow={handleAllow}
            onCancel={handleCancel}
          />

          <div className="visitor-page__status">
            {status === "cancelled" ? (
              <p className="location-status location-status--muted">
                You chose not to continue.
              </p>
            ) : (
              <LocationStatus
                status={status}
                data={visitorData?.location ?? null}
                bestSoFar={bestSoFar}
                errorCode={errorCode}
                onRetry={status === "error" ? handleRetry : null}
                onRefresh={status === "granted" ? handleRefresh : null}
              />
            )}

            {status === "granted" && visitorData && (
              <div className="visitor-page__device">
                <DeviceInfo data={visitorData.device} />
                <p className="visitor-page__disclosure">
                  The information shown above is available through your
                  browser and is shown only to you here — it is not sent
                  anywhere or saved anywhere.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .visitor-page {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .visitor-page__main {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 28px 16px 40px;
        }

        .visitor-page__card {
          width: 100%;
          max-width: 480px;
        }

        .visitor-page__status {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .visitor-page__disclosure {
          margin: 10px 0 0;
          font-size: 0.78rem;
          color: var(--color-ink-soft);
        }

        @media (min-width: 560px) {
          .visitor-page__main {
            padding-top: 48px;
          }
        }
      `}</style>
    </div>
  );
}

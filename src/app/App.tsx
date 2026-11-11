import { lazy, Suspense, useEffect, useState } from "react";
import { LaunchPage } from "./components/LaunchPage";
import { BookmarkProvider } from "./context/BookmarkContext";

const MapView = lazy(() => import("./components/MapView").then(({ MapView }) => ({ default: MapView })));

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const showMap = hash === "#map" || hash === "#nearby";

  useEffect(() => {
    if (showMap) window.scrollTo(0, 0);
    if (hash === "#about" || hash === "#research") document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, showMap]);

  if (!showMap) return <LaunchPage />;

  return (
    <BookmarkProvider>
      <Suspense fallback={<p className="map-loading" role="status">Loading the map…</p>}>
        <MapView key={hash} locateOnOpen={hash === "#nearby"} />
      </Suspense>
    </BookmarkProvider>
  );
}

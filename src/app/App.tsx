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

  useEffect(() => {
    if (hash === "#map") window.scrollTo(0, 0);
    if (hash === "#about" || hash === "#research") document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  if (hash !== "#map") return <LaunchPage />;

  return (
    <BookmarkProvider>
      <Suspense fallback={<p className="map-loading" role="status">Loading the map…</p>}>
        <MapView />
      </Suspense>
    </BookmarkProvider>
  );
}

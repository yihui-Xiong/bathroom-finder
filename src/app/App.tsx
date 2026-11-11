import { lazy, Suspense, useEffect, useState } from "react";
import { LaunchPage } from "./components/LaunchPage";
import { BookmarkProvider } from "./context/BookmarkContext";

const MapView = lazy(() => import("./components/MapView").then(({ MapView }) => ({ default: MapView })));

export default function App() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    const serviceWorker = navigator.serviceWorker;
    const workerUrl = new URL("sw.js", document.baseURI);
    const markReady = () => setOfflineReady(serviceWorker.controller?.scriptURL === workerUrl.href);
    serviceWorker.addEventListener("controllerchange", markReady);
    markReady();
    serviceWorker.register(workerUrl).catch(() => {});
    return () => serviceWorker.removeEventListener("controllerchange", markReady);
  }, []);

  const showMap = hash === "#map" || hash === "#nearby";

  useEffect(() => {
    if (showMap) window.scrollTo(0, 0);
    if (hash === "#about" || hash === "#research") document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash, showMap]);

  if (!showMap) return <LaunchPage online={online} offlineReady={offlineReady} />;

  return (
    <BookmarkProvider>
      <Suspense fallback={<p className="map-loading" role="status">Loading the map…</p>}>
        <MapView key={hash} locateOnOpen={hash === "#nearby"} online={online} />
      </Suspense>
    </BookmarkProvider>
  );
}

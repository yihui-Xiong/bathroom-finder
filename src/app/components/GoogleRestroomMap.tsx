import { useEffect, useRef, useState } from "react";
import { cityCenter } from "../data/bathrooms";
import type { MapProps } from "./mapTypes";

type GoogleWindow = Window & {
  bathroomFinderGoogleReady?: () => void;
  gm_authFailure?: () => void;
};

function requestGoogleMaps(apiKey: string, onReady: () => void, onFailure: () => void) {
  const browser = window as GoogleWindow;
  if (typeof google !== "undefined" && typeof google.maps?.Map === "function") {
    browser.gm_authFailure = onFailure;
    onReady();
    return () => { delete browser.gm_authFailure; };
  }
  const script = document.createElement("script");
  const url = new URL("https://maps.googleapis.com/maps/api/js");
  url.search = new URLSearchParams({
    key: apiKey,
    v: "quarterly",
    loading: "async",
    callback: "bathroomFinderGoogleReady",
    auth_referrer_policy: "origin",
  }).toString();
  const timeout = window.setTimeout(onFailure, 15000);
  browser.bathroomFinderGoogleReady = () => {
    window.clearTimeout(timeout);
    onReady();
  };
  browser.gm_authFailure = onFailure;
  script.src = url.toString();
  script.async = true;
  script.onerror = onFailure;
  document.head.append(script);

  return () => {
    window.clearTimeout(timeout);
    script.remove();
    delete browser.bathroomFinderGoogleReady;
    delete browser.gm_authFailure;
  };
}

export function GoogleRestroomMap({
  apiKey, onFailure, bathrooms, center, zoom, location, onSelect, onViewportChange,
}: MapProps & { apiKey: string; onFailure: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => requestGoogleMaps(apiKey, () => {
    if (!container.current) return;
    try {
      setMap(new google.maps.Map(container.current, {
        center: cityCenter,
        zoom: 15,
        clickableIcons: false,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      }));
    } catch {
      onFailure();
    }
  }, onFailure), [apiKey, onFailure]);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("idle", () => {
      const position = map.getCenter()?.toJSON();
      if (position) onViewportChange(position);
    });
    return () => listener.remove();
  }, [map, onViewportChange]);

  useEffect(() => {
    if (!map) return;
    map.setCenter(center);
    map.setZoom(zoom);
    onViewportChange(center);
  }, [map, center, zoom, onViewportChange]);

  useEffect(() => {
    if (!map) return;
    const layer = new google.maps.Data({ map });
    const icon = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#2b7fff",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 3,
    };
    layer.setStyle((feature) => {
      const userLocation = feature.getProperty("userLocation") === true;
      return {
        icon: userLocation ? { ...icon, scale: 7, fillColor: "#0e7490" } : icon,
        title: String(feature.getProperty("title")),
        clickable: !userLocation,
      };
    });
    const byId = new Map(bathrooms.map((bathroom) => [bathroom.id, bathroom]));
    for (const bathroom of bathrooms) {
      layer.add({ id: bathroom.id, geometry: new google.maps.Data.Point(bathroom), properties: { title: bathroom.name } });
    }
    if (location) {
      layer.add({ geometry: new google.maps.Data.Point(location), properties: { title: "Your location", userLocation: true } });
    }
    const listener = layer.addListener("click", (event: google.maps.Data.MouseEvent) => {
      const id = event.feature.getId();
      const bathroom = typeof id === "string" ? byId.get(id) : undefined;
      if (bathroom) onSelect(bathroom);
    });
    return () => {
      listener.remove();
      layer.setMap(null);
    };
  }, [map, bathrooms, location, onSelect]);

  return (
    <div className="map-pane">
      <div ref={container} className="map-canvas" aria-label="Google map of restrooms" />
      {!map && <p className="map-notice" role="status">Loading Google Maps…</p>}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cityCenter } from "../data/bathrooms";
import type { MapProps } from "./mapTypes";

export function RestroomMap({ bathrooms, center, zoom, location, onSelect, onViewportChange, online }: MapProps & { online: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(cityCenter, 14);
    instance.on("moveend", () => onViewportChange(instance.wrapLatLng(instance.getCenter())));
    L.control.zoom({ position: "bottomright" }).addTo(instance);
    setMap(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
    };
  }, [onViewportChange]);

  useEffect(() => {
    if (!map || !online) return;
    setTileError(false);
    const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    tiles.on("tileerror", () => setTileError(true));
    tiles.on("tileload", () => setTileError(false));
    return () => { tiles.remove(); };
  }, [map, online]);

  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
      onViewportChange(map.getCenter());
    }
  }, [map, center, zoom, onViewportChange]);

  useEffect(() => {
    if (!map) return;
    const markers = L.layerGroup().addTo(map);
    const icon = L.divIcon({ className: "restroom-marker", iconSize: [22, 22] });
    for (const bathroom of bathrooms) {
      L.marker(bathroom, { icon, title: bathroom.name, alt: bathroom.name })
        .on("click", () => onSelect(bathroom))
        .addTo(markers);
    }
    if (location) {
      L.circleMarker(location, { radius: 8, color: "white", weight: 3, fillColor: "#0e7490", fillOpacity: 1 })
        .bindTooltip("Your location").addTo(markers);
    }
    return () => { markers.remove(); };
  }, [map, bathrooms, location, onSelect]);

  return (
    <div className="map-pane">
      <div ref={container} className={`map-canvas${online ? "" : " map-canvas-offline"}`} aria-label={online ? "Map of public restrooms" : "Offline restroom pins"} />
      {!online && <p className="map-notice" role="status">Offline. Street maps and online directions need a connection.</p>}
      {online && tileError && <p className="map-notice" role="status">Map tiles are unavailable. You can still use the results list.</p>}
    </div>
  );
}

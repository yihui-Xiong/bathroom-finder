import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Bookmark, ChevronDown, ChevronUp, LocateFixed, MapPin, Search, SlidersHorizontal, User, X } from "lucide-react";
import { BathroomCard } from "./BathroomCard";
import { BathroomDetail } from "./BathroomDetail";
import { FilterPanel, emptyFilters, travelModes } from "./FilterPanel";
import { GoogleRestroomMap } from "./GoogleRestroomMap";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { ProfileView, readGoogleKey } from "./ProfileView";
import { RestroomMap } from "./RestroomMap";
import { findSavedArea, latestSavedArea, saveArea } from "../data/savedAreas";
import { favoriteId, useBookmarks } from "../context/BookmarkContext";
import {
  cityCenter, citySource, nearbySource, distanceMiles, isAccessible, isAllGender, loadBathrooms, loadNearbyBathrooms,
  type Bathroom, type Coordinates,
} from "../data/bathrooms";

const tabs = [
  { id: "map", label: "Map", icon: MapPin },
  { id: "favorites", label: "Favorites", icon: Bookmark },
  { id: "profile", label: "Profile", icon: User },
] as const;

export function MapView({ locateOnOpen, online }: { locateOnOpen: boolean; online: boolean }) {
  const { favorites, toggleBookmark } = useBookmarks();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("map");
  const [showGuide, setShowGuide] = useState(true);
  const [entered, setEntered] = useState(false);
  const mapTab = useRef<HTMLButtonElement>(null);
  const [apiKey] = useState(readGoogleKey);
  const [googleFailed, setGoogleFailed] = useState(false);
  const failGoogle = useCallback(() => setGoogleFailed(true), []);

  const [cityBathrooms, setCityBathrooms] = useState<Bathroom[] | null>(null);
  const [cityError, setCityError] = useState(false);
  const [areaBathrooms, setAreaBathrooms] = useState<Bathroom[] | null>(null);
  const [areaError, setAreaError] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [lastSavedArea, setLastSavedArea] = useState(latestSavedArea);
  const [request, setRequest] = useState(0);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [area, setArea] = useState<Coordinates | null>(() => online ? null : lastSavedArea?.center ?? null);
  const [viewport, setViewport] = useState<Coordinates>(cityCenter);
  const [locating, setLocating] = useState(false);
  const locationRequest = useRef<AbortController | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [radius, setRadius] = useState(0.5);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sheet, setSheet] = useState<"collapsed" | "half" | "full">(online ? "collapsed" : "half");
  const [selected, setSelected] = useState<Bathroom | null>(null);

  const origin = area ?? cityCenter;
  const isNearDevice = location !== null && area?.lat === location.lat && area.lng === location.lng;
  const areaLabel = isNearDevice ? "Near your location" : area ? "Near the selected area" : "Near Bryant Park, Manhattan";
  const bathrooms = area ? areaBathrooms : cityBathrooms;
  const loadError = area ? areaError : cityError;
  const showLastSaved = !online && lastSavedArea && distanceMiles(lastSavedArea.center, origin) > 0.75;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const travelIndex = travelModes.findIndex((mode) => mode.radius === radius);
  const travelMode = travelModes[travelIndex];

  useEffect(() => {
    const controller = new AbortController();
    loadBathrooms(controller.signal).then(setCityBathrooms).catch(() => {
      if (!controller.signal.aborted) setCityError(true);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!area) return;
    const cached = findSavedArea(area);
    setAreaError(false);
    if (cached) {
      setAreaBathrooms(cached.bathrooms);
      setSavedAt(cached.savedAt);
    }
    if (!online) {
      if (!cached) setAreaError(true);
      return;
    }

    const controller = new AbortController();
    const fail = () => {
      if (!cached) setAreaError(true);
    };
    const timeout = window.setTimeout(() => {
      fail();
      controller.abort();
    }, 15000);
    loadNearbyBathrooms(area, controller.signal).then((restrooms) => {
      if (controller.signal.aborted) return;
      setAreaBathrooms(restrooms);
      setSavedAt(null);
      if (restrooms.length) setLastSavedArea(saveArea(area, restrooms));
    }).catch(() => {
      if (!controller.signal.aborted) fail();
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [area, online, request]);

  const results = useMemo(() => {
    if (!bathrooms) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return bathrooms.flatMap((bathroom) => {
      if (filters.accessible && !isAccessible(bathroom)) return [];
      if (filters.allGender && !isAllGender(bathroom)) return [];
      const distance = distanceMiles(origin, bathroom);
      if (area || !words.length) {
        if (distance > radius) return [];
      }
      const text = `${bathroom.name} ${bathroom.type} ${bathroom.address ?? ""} ${bathroom.operator} ${bathroom.notes}`.toLowerCase();
      if (!words.every((word) => text.includes(word))) return [];
      return [{ bathroom, distance }];
    }).sort((a, b) => a.distance - b.distance);
  }, [bathrooms, filters, query, origin, radius, area]);

  const markers = useMemo(() => results.map(({ bathroom }) => bathroom), [results]);
  const favoritesList = useMemo(() => {
    const known = new Map([...(cityBathrooms ?? []), ...(areaBathrooms ?? [])].map((bathroom) => [bathroom.id, bathroom]));
    return favorites.flatMap((item) => {
      const bathroom = known.get(favoriteId(item)) ?? (typeof item === "string" ? undefined : item);
      return bathroom ? [bathroom] : [];
    });
  }, [favorites, cityBathrooms, areaBathrooms]);
  const mapCenter = query && results[0] ? results[0].bathroom : origin;
  const mapProps = { bathrooms: markers, center: mapCenter, zoom: query ? 15 : 15 - travelIndex, location, onSelect: setSelected, onViewportChange: setViewport };

  const clearSearch = useCallback(() => {
    setDraft("");
    setQuery("");
  }, []);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draft.trim());
    setSheet("half");
  }

  const searchArea = useCallback((position: Coordinates) => {
    setAreaBathrooms(null);
    setSavedAt(null);
    setAreaError(false);
    setArea({ lat: position.lat, lng: position.lng });
    setLocationMessage("");
    clearSearch();
    setSheet("half");
  }, [clearSearch]);

  const locate = useCallback(() => {
    if (locationRequest.current) return;
    if (!navigator.geolocation) {
      setLocationMessage("Location is unavailable in this browser. Try Safari or Chrome, or pan the map and search the area.");
      return;
    }
    const request = new AbortController();
    locationRequest.current = request;
    setLocationMessage("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (request.signal.aborted) return;
      locationRequest.current = null;
      setLocating(false);
      const position = { lat: coords.latitude, lng: coords.longitude };
      setLocation(position);
      searchArea(position);
    }, (error) => {
      if (request.signal.aborted) return;
      locationRequest.current = null;
      setLocating(false);
      setLocationMessage(error.code === 1
        ? "Location access is blocked. Allow location for this site in your browser settings, then try again."
        : "Your device couldn’t get a location. Check Location Services and try again, or pan the map.");
    }, { timeout: 10000, maximumAge: 30000 });
  }, [searchArea]);

  useEffect(() => {
    if (!entered) return;
    let active = true;
    if (locateOnOpen) {
      locate();
    } else if (navigator.onLine) {
      navigator.permissions?.query({ name: "geolocation" }).then(({ state }) => {
        if (active && state === "granted") locate();
      }).catch(() => {
        // The location button remains available if permission status cannot be queried.
      });
    }
    return () => {
      active = false;
      locationRequest.current?.abort();
      locationRequest.current = null;
    };
  }, [entered, locate, locateOnOpen]);

  function openGuide() {
    setTab("map");
    setSheet("collapsed");
    setShowGuide(true);
  }

  function completeGuide() {
    setShowGuide(false);
    setEntered(true);
    mapTab.current?.focus({ preventScroll: true });
  }

  function restroomCard(bathroom: Bathroom, distance?: number) {
    return (
      <BathroomCard key={bathroom.id} bathroom={bathroom} distance={distance} travelMode={travelMode.directions}
        isBookmarked={favorites.some((item) => favoriteId(item) === bathroom.id)}
        onTap={() => setSelected(bathroom)} onBookmark={() => toggleBookmark(bathroom)} />
    );
  }

  const resultLabel = loadError ? "Restroom lookup unavailable" : !bathrooms ? "Loading restrooms…" :
    query ? `${results.length} search results` : `${results.length} ${results.length === 1 ? "Bathroom" : "Bathrooms"} Nearby`;

  return (
    <main className="finder" aria-label="Bathroom Finder">
      <section className="map-screen" hidden={tab !== "map"} aria-label="Find bathrooms">
        <div className="map-stage">
          {online && apiKey && !googleFailed ? <GoogleRestroomMap {...mapProps} apiKey={apiKey} onFailure={failGoogle} /> : <RestroomMap {...mapProps} online={online} />}
          <div className="map-toolbar">
            <div className="search-row">
              <form className="search-form" onSubmit={search} role="search">
                <input aria-label="Search for bathrooms" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search for bathrooms…" />
                {(draft || query) && <button type="button" aria-label="Clear search" onClick={clearSearch}><X size={17} /></button>}
                <button type="submit" aria-label="Search"><Search size={17} /></button>
              </form>
              <button type="button" className="icon-button" aria-label="Use my location" disabled={locating} onClick={locate}><LocateFixed size={23} /></button>
              <button type="button" className="icon-button" aria-label="Filters" onClick={() => setShowFilters(true)}>
                <SlidersHorizontal size={23} />{activeFilterCount > 0 && <span className="filter-dot" />}
              </button>
            </div>
            {locationMessage && <p className="location-message" role="status">{locationMessage}</p>}
            {locating && <p className="location-message" role="status">Getting your location…</p>}
            {online && googleFailed && <p className="location-message" role="status">Google Maps is unavailable. Check your key in Profile.</p>}
            {!query && !locating && <span className="map-pill radius-pill">{isNearDevice ? "Your location" : area ? "Selected area" : "NYC preview"} · {radius} mi</span>}
            {online && distanceMiles(viewport, origin) > Math.min(0.2, radius / 2) &&
              <button type="button" className="map-pill area-pill" onClick={() => searchArea(viewport)}>Search this area</button>}
            {showLastSaved && <button type="button" className="map-pill area-pill" onClick={() => searchArea(lastSavedArea.center)}>Open last saved area</button>}
          </div>
          {sheet === "collapsed" && <button type="button" className="map-pill results-toggle" onClick={() => setSheet("half")}>
            <span aria-live="polite">{resultLabel}</span><ChevronUp size={19} />
          </button>}
        </div>

        <section className={`results-sheet results-sheet--${sheet}`} aria-label="Restroom results">
          <button type="button" className="sheet-handle" aria-label={sheet === "collapsed" ? "Show results" : "Collapse results"} onClick={() => setSheet(sheet === "collapsed" ? "half" : "collapsed")}><span /></button>
          <div className="sheet-heading">
            <div><h1 aria-live="polite">{resultLabel}</h1><p className="results-context">{query ? `Matches for “${query}”` : areaLabel}</p>
              {savedAt && <p className="results-context">Saved {new Date(savedAt).toLocaleDateString()}</p>}
            </div>
            <button className="icon-button" type="button" aria-label={sheet === "full" ? "Show less" : "Expand results"} onClick={() => setSheet(sheet === "full" ? "half" : "full")}>
              {sheet === "full" ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
            </button>
          </div>
          <div className="results-list">
            {loadError ? <div className="empty-state" role="alert">
              <p>{online ? "Couldn’t load restroom listings." : "No saved listings for this area. Reconnect to search."}</p>
              {online && <button type="button" className="text-link" onClick={() => {
                if (!area) { window.location.reload(); return; }
                setAreaError(false);
                setRequest((value) => value + 1);
              }}>Try again</button>}
              {!online && area && <button type="button" className="text-link" onClick={() => {
                setArea(null);
                setSavedAt(null);
                clearSearch();
              }}>Browse NYC directory</button>}
            </div> : !bathrooms ? null : results.length ? results.map(({ bathroom, distance }) => restroomCard(bathroom, distance)) :
              <p className="empty-state">{query ? "No facilities match this search." : "No restrooms found. Try a larger radius or adjust your filters."}</p>}
          </div>
          <footer className="results-footer">
            <a href={area ? nearbySource : citySource} target="_blank" rel="noreferrer">{area ? "REFUGE Restrooms" : "NYC Open Data"}</a>
            <span>Hours and access can change.</span>
          </footer>
        </section>
      </section>

      {tab === "favorites" && <section className="secondary-screen favorites-screen" aria-labelledby="favorites-title">
        <header className="screen-heading"><Bookmark size={23} /><h1 id="favorites-title">Favorites</h1></header>
        <div className="results-list">
          {favoritesList.length ? favoritesList.map((bathroom) => restroomCard(bathroom, location ? distanceMiles(location, bathroom) : undefined)) :
            <p className="empty-state">Use the bookmark button to save a restroom.</p>}
        </div>
      </section>}
      {tab === "profile" && <ProfileView apiKey={apiKey} googleFailed={googleFailed} onShowGuide={openGuide} />}

      <nav className="bottom-nav" aria-label="Bathroom Finder views">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} ref={id === "map" ? mapTab : undefined} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>
          <Icon size={23} /><span>{label}</span>
        </button>)}
      </nav>

      {showGuide && <OnboardingOverlay onComplete={completeGuide} />}
      {showFilters && <FilterPanel radius={radius} filters={filters}
        onClose={() => setShowFilters(false)}
        onApply={(newRadius, newFilters) => {
          setRadius(newRadius);
          setFilters(newFilters);
          setShowFilters(false);
          setSheet("half");
        }} />}
      {selected && <BathroomDetail bathroom={selected} onClose={() => setSelected(null)}
        travelMode={travelMode.directions}
        isBookmarked={favorites.some((item) => favoriteId(item) === selected.id)} onBookmark={() => toggleBookmark(selected)} />}
    </main>
  );
}

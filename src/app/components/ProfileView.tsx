import { useState, type FormEvent } from "react";
import { ChevronRight, Info, MapPin, User } from "lucide-react";

const deploymentGoogleKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY?.trim() ?? "";
const googleKeyStorage = "bathroom-finder:google-maps-key";
const demoKeyUrl = "https://console.cloud.google.com/google/maps-hosted/tos?ref=https%3A%2F%2Fdevelopers.google.com%2Fmaps%2F";

function savedGoogleKey() {
  try {
    return localStorage.getItem(googleKeyStorage) ?? "";
  } catch {
    return "";
  }
}

export function readGoogleKey() {
  return savedGoogleKey() || deploymentGoogleKey;
}

interface Props {
  apiKey: string;
  googleFailed: boolean;
  online: boolean;
  onShowGuide: () => void;
}

export function ProfileView({ apiKey, googleFailed, online, onShowGuide }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const hasSavedKey = Boolean(savedGoogleKey());
  const mapStatus = !online ? "Offline map" : googleFailed ? "OpenStreetMap · Google Maps couldn’t load" :
    apiKey ? "Google Maps selected" : "OpenStreetMap";

  function updateKey(key: string) {
    try {
      if (key) localStorage.setItem(googleKeyStorage, key);
      else localStorage.removeItem(googleKeyStorage);
      // The Google Maps script loads once per document with the selected key.
      window.history.replaceState(window.history.state, "", "#profile");
      window.location.reload();
    } catch {
      setError("This browser could not save the map setting.");
    }
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = draft.trim();
    if (!/^[A-Za-z0-9_-]{20,128}$/.test(key)) {
      setError("Enter a valid Maps JavaScript API key.");
      return;
    }
    updateKey(key);
  }

  return (
    <section className="secondary-screen profile-screen" aria-labelledby="profile-title">
      <div className="profile-content">
        <header className="profile-header">
          <span className="profile-avatar"><User size={38} aria-hidden="true" /></span>
          <h1 id="profile-title">Profile</h1>
          <p>Favorites and map settings are saved in this browser.</p>
        </header>

        <div className="profile-settings">
          <button type="button" className="profile-row" onClick={onShowGuide}>
            <span className="profile-row-icon"><Info size={21} aria-hidden="true" /></span>
            <span className="profile-row-text"><strong>Show App Guide</strong><small>Review how to use the map</small></span>
            <ChevronRight className="profile-chevron" size={19} aria-hidden="true" />
          </button>

          <details className="profile-maps">
            <summary className="profile-row">
              <span className="profile-row-icon"><MapPin size={21} aria-hidden="true" /></span>
              <span className="profile-row-text"><strong>Map settings</strong><small aria-live="polite">{mapStatus}</small></span>
              <ChevronRight className="profile-chevron" size={19} aria-hidden="true" />
            </summary>
            <div className="profile-map-options">
              <h2>Google Maps</h2>
              {googleFailed && <p>Check that your key allows this website and the Maps JavaScript API.</p>}
              {(!apiKey || googleFailed) && <p>
                <a className="text-link" href={demoKeyUrl} target="_blank" rel="noopener noreferrer">Get a Google Maps demo key</a> with a personal Google account, then paste it below.
              </p>}
              {!hasSavedKey && apiKey && <p>This site supplies a key. You can add your own for this browser.</p>}
              <form onSubmit={save} className="google-key-form">
                <label htmlFor="maps-key">{hasSavedKey ? "Replace browser key" : "Google Maps browser key"}</label>
                <input id="maps-key" type="password" autoComplete="off" value={draft}
                  onChange={(event) => { setDraft(event.target.value); setError(""); }}
                  aria-invalid={Boolean(error)} aria-describedby={error ? "maps-key-error" : undefined} required />
                {error && <p id="maps-key-error" className="profile-error" role="alert">{error}</p>}
                <button className="primary-button" type="submit">Save map key</button>
              </form>
              {hasSavedKey && <button type="button" className="text-link" onClick={() => updateKey("")}>
                {deploymentGoogleKey ? "Use the site key" : "Remove saved key"}
              </button>}
              <p className="card-meta">For a standard key, allow <code>{window.location.origin}/*</code> in Google Cloud.</p>
              <a className="text-link" href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noreferrer">Google Maps key setup</a>
            </div>
          </details>

          <a className="profile-row" href="#about">
            <span className="profile-row-icon"><Info size={21} aria-hidden="true" /></span>
            <span className="profile-row-text"><strong>About Bathroom Finder</strong><small>Project background and data sources</small></span>
            <ChevronRight className="profile-chevron" size={19} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

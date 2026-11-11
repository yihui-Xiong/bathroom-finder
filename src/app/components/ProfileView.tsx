import { useState, type FormEvent } from "react";
import { ChevronRight, Info, MapPin, User } from "lucide-react";

const deploymentGoogleKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY?.trim() ?? "";
const googleKeyStorage = "bathroom-finder:google-maps-key";

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
  onShowGuide: () => void;
}

export function ProfileView({ apiKey, googleFailed, onShowGuide }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const origin = window.location.origin;
  const usingSiteKey = Boolean(deploymentGoogleKey && !savedGoogleKey());

  function updateKey(key: string) {
    try {
      if (key) localStorage.setItem(googleKeyStorage, key);
      else localStorage.removeItem(googleKeyStorage);
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
      <header className="screen-heading"><User size={23} /><h1 id="profile-title">Profile</h1></header>
      <button type="button" className="settings-card guide-link" onClick={onShowGuide}>
        <Info size={20} aria-hidden="true" />
        <span>Show App Guide</span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
      <div className="settings-card">
        <h2><MapPin size={19} /> Google Maps</h2>
        <p>{googleFailed ? "Google Maps could not load. Check your key, API settings, and website restriction." : usingSiteKey ? "Google Maps is enabled for this site." : apiKey ? "Google Maps is selected on this browser." : "Add a browser key to use Google Maps in the app."}</p>
        {(!apiKey || googleFailed) && <>
          <p>For a prototype, sign in with a personal Google account to get a free demo key, then paste it below.</p>
          <a className="text-link" href="https://console.cloud.google.com/google/maps-hosted/tos?ref=https%3A%2F%2Fdevelopers.google.com%2Fmaps%2F" target="_blank" rel="noopener noreferrer">Get a Google Maps demo key</a>
        </>}
        <p>For a standard key, enable Maps JavaScript API and billing in Google Cloud. Restrict the key to this API and website.</p>
        <code>{origin}/*</code>
        <form onSubmit={save} className="google-key-form">
          <label htmlFor="maps-key">{apiKey ? "Replace browser key" : "Google Maps browser key"}</label>
          <input id="maps-key" type="password" autoComplete="off" value={draft} onChange={(event) => { setDraft(event.target.value); setError(""); }} required />
          <button className="primary-button" type="submit">Save and reload</button>
        </form>
        {savedGoogleKey() && <button type="button" className="text-link" onClick={() => updateKey("")}>{deploymentGoogleKey ? "Use the site key" : "Remove saved key"}</button>}
        {error && <p role="alert">{error}</p>}
        <p className="card-meta">The key is stored in this browser and sent to Google when the map loads.</p>
        <a className="text-link" href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noreferrer">Google Maps key setup</a>
      </div>
      <a className="settings-card guide-link" href="#about">About Bathroom Finder <ChevronRight size={18} aria-hidden="true" /></a>
    </section>
  );
}

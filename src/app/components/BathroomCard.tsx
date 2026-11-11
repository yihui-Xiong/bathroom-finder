import { Accessibility, Bookmark, Navigation, Users } from "lucide-react";
import { directionsUrl, isAccessible, isAllGender, type Bathroom, type DirectionsMode } from "../data/bathrooms";

interface Props {
  bathroom: Bathroom;
  distance?: number;
  travelMode: DirectionsMode;
  isBookmarked: boolean;
  onTap: () => void;
  onBookmark: () => void;
}

export function BathroomCard({ bathroom, distance, travelMode, isBookmarked, onTap, onBookmark }: Props) {
  return (
    <article className="bathroom-card">
      <button type="button" className="card-main" onClick={onTap}>
        <span className="card-title">{bathroom.name}</span>
        <span className="card-meta">{[bathroom.address || bathroom.type, distance === undefined ? "" : `${distance.toFixed(2)} mi`].filter(Boolean).join(" · ")}</span>
        <span className="card-tags">
          {isAccessible(bathroom) && <span><Accessibility size={14} /> Accessible</span>}
          {isAllGender(bathroom) && <span className="gender-tag"><Users size={14} /> Gender neutral</span>}
        </span>
      </button>
      <div className="card-actions">
        <button type="button" className="icon-button card-save" aria-label={`Save ${bathroom.name}`} aria-pressed={isBookmarked} onClick={onBookmark}>
          <Bookmark size={19} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
        <a className="icon-button card-directions" aria-label={`Directions to ${bathroom.name}`} href={directionsUrl(bathroom, travelMode)} target="_blank" rel="noopener noreferrer">
          <Navigation size={16} />
        </a>
      </div>
    </article>
  );
}

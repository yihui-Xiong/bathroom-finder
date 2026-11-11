import { useEffect, useRef } from "react";
import { Bookmark, Navigation, X } from "lucide-react";
import { directionsUrl, type Bathroom, type DirectionsMode } from "../data/bathrooms";

interface Props {
  bathroom: Bathroom;
  travelMode: DirectionsMode;
  isBookmarked: boolean;
  onBookmark: () => void;
  onClose: () => void;
}

export function BathroomDetail({ bathroom, travelMode, isBookmarked, onBookmark, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);

  const details = [
    ["Location", bathroom.address],
    ["Hours", bathroom.hours || "Hours unavailable"],
    ["Season", bathroom.season],
    ["Accessibility", bathroom.accessibility || "Accessibility information unavailable"],
    ["Restroom type", bathroom.restroomType],
    ["Changing stations", bathroom.changingStations],
    ["Access notes", bathroom.notes],
  ];

  return (
    <dialog ref={dialog} onClose={onClose} className="detail-dialog" aria-labelledby="detail-title">
      <div className="detail-header">
        <div>
          <p className="card-meta">{[bathroom.type, bathroom.operator].filter(Boolean).join(" · ")}</p>
          <h2 id="detail-title">{bathroom.name}</h2>
        </div>
        <button type="button" className="icon-button" aria-label="Close details" onClick={() => dialog.current?.close()}>
          <X size={20} />
        </button>
      </div>
      <div className="detail-actions">
        <a className="primary-button" href={directionsUrl(bathroom, travelMode)} target="_blank" rel="noopener noreferrer">
          <Navigation size={17} /> Directions
        </a>
        <button type="button" className="icon-button" aria-label="Save to favorites" aria-pressed={isBookmarked} onClick={onBookmark}>
          <Bookmark size={19} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <dl className="detail-list">
        {details.filter(([, value]) => value).map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      {bathroom.website && <a className="text-link" href={bathroom.website} target="_blank" rel="noopener noreferrer">Facility website</a>}
    </dialog>
  );
}

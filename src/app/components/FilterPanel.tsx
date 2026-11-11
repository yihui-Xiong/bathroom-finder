import { useEffect, useRef } from "react";
import { Accessibility, Bike, Car, Footprints, PersonStanding, Users, X } from "lucide-react";

export const travelModes = [
  { label: "Walk", radius: 0.5, directions: "walking", icon: Footprints },
  { label: "Run", radius: 1, directions: "walking", icon: PersonStanding },
  { label: "Bike", radius: 2, directions: "bicycling", icon: Bike },
  { label: "Drive", radius: 5, directions: "driving", icon: Car },
] as const;

const filterOptions = [
  { key: "accessible", label: "Wheelchair accessible", icon: Accessibility },
  { key: "allGender", label: "Gender neutral", icon: Users },
] as const;

export const emptyFilters = { accessible: false, allGender: false };
export type Filters = typeof emptyFilters;

interface Props {
  radius: number;
  filters: Filters;
  onApply: (radius: number, filters: Filters) => void;
  onClose: () => void;
}

export function FilterPanel({ radius, filters, onApply, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);

  return (
    <dialog ref={dialog} className="detail-dialog sheet-dialog" onClose={onClose} aria-labelledby="filter-title">
      <div className="detail-header">
        <h2 id="filter-title">Filters</h2>
        <button type="button" className="icon-button" aria-label="Close filters" onClick={() => dialog.current?.close()}><X size={21} /></button>
      </div>
      <form className="filters" onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        onApply(Number(values.get("radius")), {
          accessible: values.has("accessible"),
          allGender: values.has("allGender"),
        });
      }}>
        <fieldset>
          <legend>Transportation Mode</legend>
          <p className="card-meta">Sets the search radius for nearby results</p>
          <div className="travel-options">
            {travelModes.map(({ label, radius: value, icon: Icon }) => (
              <label key={value}><input type="radio" name="radius" value={value} defaultChecked={radius === value} />
                <span><Icon size={22} />{label}<small>{value} mi radius</small></span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Accessibility and Amenities</legend>
          {filterOptions.map(({ key, label, icon: Icon }) => (
            <label className="filter-option" key={key}><Icon size={21} /><span>{label}</span><input type="checkbox" name={key} defaultChecked={filters[key]} /></label>
          ))}
        </fieldset>
        <button type="submit" className="primary-button">Show Results</button>
      </form>
    </dialog>
  );
}

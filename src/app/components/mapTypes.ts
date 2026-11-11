import type { Bathroom, Coordinates } from "../data/bathrooms";

export interface MapProps {
  bathrooms: Bathroom[];
  center: Coordinates;
  zoom: number;
  location: Coordinates | null;
  onSelect: (bathroom: Bathroom) => void;
  onViewportChange: (center: Coordinates) => void;
}

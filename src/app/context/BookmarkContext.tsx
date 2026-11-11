import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Bathroom } from "../data/bathrooms";

type SavedBathroom = string | Bathroom;
const key = "bathroom-finder:favorites";
const BookmarkContext = createContext<{
  favorites: SavedBathroom[];
  toggleBookmark: (bathroom: Bathroom) => void;
} | null>(null);

export function favoriteId(item: SavedBathroom) {
  return typeof item === "string" ? item : item.id;
}

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<SavedBathroom[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      return Array.isArray(saved) ? saved.filter((item) => typeof item === "string" || (
        item && typeof item.id === "string" && typeof item.name === "string" &&
        Number.isFinite(item.lat) && Number.isFinite(item.lng)
      )) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch {
      // Favorites remain available for the current session.
    }
  }, [favorites]);

  function toggleBookmark(bathroom: Bathroom) {
    setFavorites((saved) => saved.some((item) => favoriteId(item) === bathroom.id)
      ? saved.filter((item) => favoriteId(item) !== bathroom.id)
      : [bathroom, ...saved]);
  }

  return <BookmarkContext.Provider value={{ favorites, toggleBookmark }}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error("BookmarkProvider is required.");
  return context;
}

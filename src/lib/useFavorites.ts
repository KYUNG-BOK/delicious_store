import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Restaurant } from "../types";

const LS_KEY = "fav:restaurants:v1";
const EVT = "fav:update"; 

type FavItem = Pick<
  Restaurant,
  "id" | "name" | "img" | "category" | "price" | "time" | "lat" | "lon" | "rating"
>;

function safeGetItem(key: string) {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetItem(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
  }
}

function loadFromStorage(): FavItem[] {
  try {
    const raw = safeGetItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveToStorage(items: FavItem[]) {
  safeSetItem(LS_KEY, JSON.stringify(items));
  if (typeof window !== "undefined") {
    // 같은 탭에도 갱신 알림
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

export function useFavorites() {
  const [items, setItems] = useState<FavItem[]>(() => loadFromStorage());

  const syncingFromStorageRef = useRef(false);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) {
        syncingFromStorageRef.current = true;
        setItems(loadFromStorage());
      }
    };
    const onSameTab = () => {
      syncingFromStorageRef.current = true;
      setItems(loadFromStorage());
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(EVT, onSameTab as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVT, onSameTab as EventListener);
    };
  }, []);

  useEffect(() => {
    if (syncingFromStorageRef.current) {
      syncingFromStorageRef.current = false;
      return;
    }
    saveToStorage(items);
  }, [items]);

  const ids = useMemo(() => new Set(items.map((i) => String(i.id))), [items]);
  const isFav = useCallback((id: string | number) => ids.has(String(id)), [ids]);

  const toFavItem = (r: Restaurant | FavItem): FavItem => ({
    id: String(r.id) as any,
    name: r.name,
    img: r.img,
    category: r.category,
    price: r.price,
    time: r.time,
    lat: r.lat,
    lon: r.lon,
    rating: r.rating,
  });

  const add = useCallback((r: Restaurant | FavItem) => {
    setItems((prev) => {
      const key = String(r.id);
      if (prev.some((p) => String(p.id) === key)) return prev;
      const next = [toFavItem(r), ...prev];
      return next;
    });
  }, []);

  const remove = useCallback((id: string | number) => {
    const key = String(id);
    setItems((prev) => prev.filter((p) => String(p.id) !== key));
  }, []);

  const toggle = useCallback((r: Restaurant | FavItem) => {
    setItems((prev) => {
      const key = String(r.id);
      const exists = prev.some((p) => String(p.id) === key);
      if (exists) return prev.filter((p) => String(p.id) !== key);
      return [toFavItem(r), ...prev];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, isFav, add, remove, toggle, clear };
}

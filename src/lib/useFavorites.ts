import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Restaurant } from "../types";
import type { FavItem } from "./favorites/types";
import { LS_KEY, EVT, loadFromStorage, saveToStorage } from "./favorites/storage";
import { apiAddOrUpdateFavorite, apiDeleteAllCurrentOnServer, apiDeleteFavoriteById, apiGetFavorites } from "./favorites/api";

function toFavItemSafe(r: Restaurant | FavItem | null | undefined): FavItem | null {
  if (!r) return null;
  const id = r?.id != null ? String(r.id) : "";
  if (!id) return null;
  const name = (r as any)?.name ?? "이름 없음";
  const rating = typeof (r as any)?.rating === "number" ? (r as any).rating : 0;
  return {
    id,
    name,
    img: (r as any)?.img ?? undefined,
    category: (r as any)?.category ?? undefined,
    price: (r as any)?.price ?? undefined,
    time: (r as any)?.time ?? undefined,
    lat: (r as any)?.lat ?? undefined,
    lon: (r as any)?.lon ?? undefined,
    rating,
  };
}

export function useFavorites() {
  const [items, setItems] = useState<FavItem[]>(() => loadFromStorage());
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const syncingRef = useRef(false);
  const didInitRef = useRef(false);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) { syncingRef.current = true; setItems(loadFromStorage()); }
    };
    const onSameTab = () => { syncingRef.current = true; setItems(loadFromStorage()); };

    window.addEventListener("storage", onStorage);
    window.addEventListener(EVT, onSameTab as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(EVT, onSameTab as EventListener);
    };
  }, []);

  // 상태 → 로컬 저장
  useEffect(() => {
    if (syncingRef.current) { syncingRef.current = false; return; }
    saveToStorage(items);
  }, [items]);

  // 최초 서버 동기화 (한 번)
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const server = await apiGetFavorites();
        setItems(server);
      } catch (e: any) {
        setError(e?.message ?? "즐겨찾기 불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const ids = useMemo(() => new Set(items.map(i => String(i.id))), [items]);
  const isFav = useCallback((id: string | number) => ids.has(String(id)), [ids]);

  // 추가/업데이트
  const add = useCallback(async (r: Restaurant | FavItem | null | undefined) => {
    const item = toFavItemSafe(r);
    if (!item) return;
    const key = String(item.id);
    const prevSnapshot = items;
    setItems(prev => [item, ...prev.filter(p => String(p.id) !== key)]);
    try {
      await apiAddOrUpdateFavorite(item);
    } catch (e) {
      setItems(prevSnapshot); // 롤백
      throw e;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // 삭제
  const remove = useCallback(async (id: string | number | null | undefined) => {
    const key = id != null ? String(id) : "";
    if (!key) return;
    const prevSnapshot = items;
    setItems(prev => prev.filter(p => String(p.id) !== key));
    try {
      await apiDeleteFavoriteById(key);
    } catch (e) {
      setItems(prevSnapshot); // 롤백
      throw e;
    }
  }, [items]);

  // 토글
  const toggle = useCallback(async (r: Restaurant | FavItem | null | undefined) => {
    const item = toFavItemSafe(r);
    if (!item) return;
    const key = String(item.id);
    if (isFav(key)) await remove(key);
    else await add(item);
  }, [isFav, add, remove]);

  // 로컬만 비우기
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  // 서버에서 다시 불러오기
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const server = await apiGetFavorites();
      setItems(server);
    } catch (e: any) {
      setError(e?.message ?? "즐겨찾기 새로고침 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  // 서버까지 모두 삭제(옵션)
  const clearServer = useCallback(async () => {
    const prevSnapshot = items;
    setItems([]); // 낙관적 비우기
    try {
      await apiDeleteAllCurrentOnServer();
    } catch (e) {
      setItems(prevSnapshot); // 실패 시 롤백
      throw e;
    }
  }, [items]);

  return {
    items, isFav, add, remove, toggle,
    clear, refresh, loading, error,
    clearServer, // 쓰지 않으면 무시해도 됨
  };
}

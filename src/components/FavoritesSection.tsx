import { useFavorites } from "../lib/useFavorites";
import RestaurantCard from "./RestaurantCard";
import { useState } from "react";

export default function FavoritesSection() {
  const { items, clearServer } = useFavorites();
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  if (!items.length) {
    return <div className="p-4 text-sm opacity-70">아직 찜한 가게가 없어요.</div>;
  }

  const handleClear = async () => {
    setBusy(true);
    setErrMsg(null);
    try {
      await clearServer(); 
    } catch (e: any) {
      setErrMsg(e?.message ?? "삭제 중 오류가 발생했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">내가 찜한 맛집</h2>
        <button className="btn btn-sm btn-outline" onClick={handleClear} disabled={busy}>
          {busy ? "비우는 중…" : "모두 비우기"}
        </button>
      </div>

      {errMsg && <div className="alert alert-error text-sm">{errMsg}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <RestaurantCard key={String(it.id)} item={it as any} />
        ))}
      </div>
    </section>
  );
}

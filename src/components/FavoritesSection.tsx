import { useFavorites } from "../lib/useFavorites";
import RestaurantCard from "./RestaurantCard";

export default function FavoritesSection() {
  const { items, clear } = useFavorites();

  if (!items.length) {
    return <div className="p-4 text-sm opacity-70">아직 찜한 가게가 없어요.</div>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">내가 찜한 맛집</h2>
        <button className="btn btn-sm btn-outline" onClick={clear}>모두 비우기</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <RestaurantCard key={it.id} item={it as any} />
        ))}
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { spring } from "../lib/animations";
import RatingStars from "./RatingStars";
import type { Restaurant } from "../types";
import { useFavorites } from "../lib/useFavorites";

// 맛집 카드를 출력하는 컴포넌트, framer-motion 라이브러리를 사용했습니다.
type Props = {
  item: Restaurant;
  onDetail?: (item: Restaurant) => void;
};

/*
  백엔드: 이미지 경로(src, alt)를 JSON에 담아서 응답
  프론트(adaptPlace): IMG_BASE + src → 전체 URL로 변환
  UI(RestaurantCard): <img src={item.img} /> 로 실제 화면에 출력
*/
export default function RestaurantCard({ item, onDetail }: Props) {
  const { isFav, toggle } = useFavorites();
  const liked = isFav(item.id);

  const rating =
    typeof item.rating === "number" && Number.isFinite(item.rating)
      ? item.rating
      : 0;
  const distanceKm =
    typeof item.distanceKm === "number" && Number.isFinite(item.distanceKm)
      ? item.distanceKm
      : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={spring}
      className="card bg-base-100 text-base-content shadow-md hover:shadow-xl transition-shadow"
    >
      <figure className="relative h-48 overflow-hidden">
        <motion.img
          src={item.img}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.05 }} // hover하면 살짝 확대
          transition={{ type: "spring" as const, stiffness: 220, damping: 22 }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-300/20 to-transparent" />
      </figure>

      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="card-title leading-tight">{item.name}</h3>
            <p className="text-sm opacity-90">
              {item.category} · {item.price} · {item.time}
            </p>
          </div>
          <div className="text-right">
            <RatingStars value={rating} name={String(item.id)} />
            <div className="text-xs opacity-90">★ {rating.toFixed(1)}</div>
          </div>
        </div>

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <div key={t} className="badge badge-outline">
                #{t}
              </div>
            ))}
          </div>
        )  : null}

        <div className="card-actions items-center justify-between mt-auto">
          <span className="text-xs opacity-90">약 {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}</span>
          <div className="join">
            <button
              className="btn btn-sm join-item"
              onClick={() => onDetail?.(item)}
            >
              자세히
            </button>
            <button
              className={`btn btn-sm join-item ${liked ? "btn-secondary" : "btn-outline"}`}
              onClick={(e) => {
                e.stopPropagation(); // 카드 클릭 등과 충돌 방지
                toggle(item);
              }}
              aria-pressed={liked}
              aria-label={liked ? "찜 해제" : "찜하기"}
              title={liked ? "찜 해제" : "찜하기"}
            >
              {liked ? "찜" : "찜하기"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

import type { BEPlace, Restaurant } from "../types";
import { IMG_BASE } from "./api";

export function adaptPlace(p: BEPlace): Restaurant {
  const guessCategory =
    /냉면|순두부|비빔밥|닭강정/.test(p.title) ? "한식" :
    /흑돼지|갈비/.test(p.title) ? "고기" :
    /짜장/.test(p.title) ? "중식" :
    /카페/.test(p.title) ? "카페" :
    /해산물/.test(p.title) ? "해산물" :
    "카테고리";

  const price: Restaurant["price"] = "₩₩";
  const time = "10:00 - 21:00";
  const distanceKm = Math.random() * 3 + 0.3;
  const img = `${IMG_BASE}/${p.image.src}`;

  return {
    id: p.id,
    name: p.title,
    category: guessCategory,
    rating: 4 + Math.random() * 1,
    price,
    time,
    distanceKm,
    img,
    tags: p.description ? p.description.split(" ").slice(0, 2) : undefined,
    desc: p.description,
    lat: p.lat,
    lon: p.lon,
    alt: p.image.alt,
  };
}

// 빈화면 뜨면, 싫어하기 때문에 
export const FALLBACK: Restaurant[] = [
  {
    id: "fallback-1",
    name: "샘플 맛집",
    category: "한식",
    rating: 4.6,
    price: "₩₩",
    time: "11:00 - 21:30",
    distanceKm: 0.5,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
    tags: ["예시", "가성비"],
  },
];

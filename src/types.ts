export type BEPlace = {
  id: string;
  title: string;
  image: { src: string; alt?: string };
  lat: number;
  lon: number;
  description?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  category: string;
  rating: number; // 0~5
  price: "₩" | "₩₩" | "₩₩₩";
  time: string;
  distanceKm: number;
  img: string;
  tags?: string[];
  desc?: string;
  lat?: number;
  lon?: number;
  alt?: string;
};

export const CATEGORIES = [
  "전체",
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "카페",
  "디저트",
  "고기",
  "해산물",
  "갈비",
] as const;

import type { BEPlace, Restaurant } from "../types";
import { IMG_BASE } from "./api";

/*
  백엔드 원본 데이터는 그대로 UI에 쓰기 어렵기 때문에 adaptPlace를 사용
    image.src → IMG_BASE와 합쳐 최종 URL,
    title → name,
    desc → tags 자동 추출,
    lat/lon → distanceKm 계산

    이렇게 변환해두면 UI 컴포넌트는 Restaurant 타입만 알면 돼서 깔끔해짐!
*/

// 기본 위치: 서울시청 좌표
const DEFAULT_ORIGIN = { lat: 37.5665, lon: 126.9780 };

function stableRating(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const x = (h >>> 0) / 0xffffffff;
  return 4 + x * 1;
}

// 하비사인 함수 사용 : 위도·경도 두 지점 사이의 실제 거리(km)를 계산하는 함수
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  // (도 → 라디안) 변환 함수
  // 👉 삼각함수(Math.sin, Math.cos)는 각도를 '라디안(rad)' 단위로 받기 때문에
  //    우리가 흔히 쓰는 '도(degree)'를 '라디안'으로 바꿔야 함
  const toRad = (d: number) => (d * Math.PI) / 180;

  // 지구의 반지름 (km)
  // 👉 구 모양인 지구의 중심에서 지표면까지의 평균 거리
  const R = 6371;

  // 위도 차이(라디안 단위)
  const dLat = toRad(lat2 - lat1);

  // 경도 차이(라디안 단위)
  const dLon = toRad(lon2 - lon1);

  // haversine 공식 적용
  // 👉 구 위의 두 점 사이 '호(arc)'의 중심각을 구하는 과정
  //    (피타고라스 공식이 아닌, 구면 기하학 공식임)
  const a =
    Math.sin(dLat / 2) ** 2 +                         // 위도 차이 반만큼의 사인값 제곱
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *   // 두 점의 위도를 코사인으로 보정
    Math.sin(dLon / 2) ** 2;                          // 경도 차이 반만큼의 사인값 제곱

  // 중심각(라디안) 계산
  // 👉 두 점 사이의 각도를 구함
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 최종 거리(km)
  // 👉 지구 반지름 × 중심각 = 두 점 사이의 거리
  return R * c;
}

export function adaptPlace(
  p: BEPlace,
  origin?: { lat: number; lon: number }
): Restaurant {
  const guessCategory =
    /냉면|순두부|비빔밥|닭강정/.test(p.title) ? "한식" :
    /흑돼지|갈비/.test(p.title) ? "고기" :
    /짜장/.test(p.title) ? "중식" :
    /카페/.test(p.title) ? "카페" :
    /해산물/.test(p.title) ? "해산물" :
    "카테고리";

  const price: Restaurant["price"] = "₩₩";
  const time = "18:00 - 21:00";

  // 위도(lat), 경도(lon)가 숫자인지 확인 (좌표가 있어야 거리 계산 가능)
  const hasCoords = typeof p.lat === "number" && typeof p.lon === "number";
  
  // 위치 기준점: 사용자 위치(origin) → 없으면 서울시청 좌표
  const base = origin ?? DEFAULT_ORIGIN;

  // 거리 계산
  const distanceKm =
    hasCoords
      // 좌표(lat/lon)가 있으면 → 기준점(origin, 즉 현재위치 못잡아오면 서울시청)과의 실제 거리(km) 계산
      ? haversineKm(base.lat, base.lon, p.lat!, p.lon!)
      // 좌표가 아예 없을경우 → 임시로 0.3km ~ 3.3km 사이의 랜덤 거리 넣기
      : Math.random() * 3 + 0.3;

  // 이미지 주소 만들기 (기본 경로 + 파일명)
  const img = `${IMG_BASE}/${p.image.src}`;

  // 최종적으로 화면에서 바로 쓸 수 있는 데이터 객체를 만들어 반환
  return {
    id: p.id,                                  // 고유 번호
    name: p.title,                             // 이름 (예: 가게 이름, 장소 이름)
    category: guessCategory,                   // 카테고리 (자동 분류한 값)
    rating: stableRating(String(p.id ?? p.title)), // 평점 (항상 같은 값 나오도록 계산)
    price,                                     // 가격대
    time,                                      // 영업 시간
    distanceKm,                                // 계산한 거리 (km 단위)
    img,                                       // 이미지 주소
    tags: p.description
      ? p.description.split(" ").slice(0, 2)   // 해시태그, 앞에 단어
      : undefined,
    desc: p.description,                       // 전체 설명
    lat: p.lat,                                // 위도 (지도 표시할 때 사용)
    lon: p.lon,                                // 경도 (지도 표시할 때 사용)
    alt: p.image.alt,                          // 이미지 대체 텍스트 (이미지 깨졌을 때 표시)
  };
}

// 빈 화면이 뜨는 걸 방지하기 위한 기본 데이터
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

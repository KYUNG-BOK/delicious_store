import type { Restaurant } from "../../types";

/**
 * 즐겨찾기(FavItem) 데이터 구조 정의
 * 
 * - Restaurant 타입을 일부 참조해서 필드 타입 일관성 유지
 * - 로컬스토리지/서버에 저장되는 단일 "즐겨찾기 항목"을 표현
 */
export type FavItem = {
  id: Restaurant["id"];           // 원본 Restaurant의 고유 ID
  name: Restaurant["name"];       // 식당 이름
  img?: string;                   // 대표 이미지 (없을 수도 있음)
  category?: Restaurant["category"]; // 카테고리 (예: 한식, 중식 등)
  price?: Restaurant["price"];    // 가격대 정보
  time?: string;                  // 운영 시간
  lat?: number;                   // 위도 좌표
  lon?: number;                   // 경도 좌표
  rating: number;                 // 평점 (기본값 0 이상 필수)
};

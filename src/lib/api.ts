// 환경변수에서 API 서버 주소를 불러오기
// - VITE_API_BASE: 백엔드 API 서버 주소
// - 값이 없으면 기본값 "" 사용
export const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";

// - VITE_IMG_BASE: 이미지 서버 주소
// - 값이 없으면 기본값으로 localhost:3000 사용
export const IMG_BASE =
  (import.meta as any).env?.VITE_IMG_BASE ?? "http://localhost:3000";

// 장소(places) 데이터를 백엔드 서버에서 불러오는 함수
export const fetchPlaces = async () => {
  // 1) API 주소 만들기
  // - API_BASE 값이 있으면 `${API_BASE}/places` 사용 (운영 서버 등)
  // - 값이 없으면 `/places` 사용 (개발 서버, 로컬 mock 데이터용)
  const url = API_BASE ? `${API_BASE}/places` : "/places";

  // 2) fetch로 서버에 요청 보내기
  const res = await fetch(url);

  // 3) 응답이 실패했을 경우 (200번대가 아닌 경우) → 에러 발생
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // 4) 응답을 JSON으로 변환해서 반환
  //    결과는 { places: [...] } 형태라고 가정
  return (await res.json()) as { places: any[] };
};

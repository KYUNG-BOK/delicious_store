import type { FavItem } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** 서버에서 즐겨찾기 목록(FavItem[]) 불러오기 */
export async function apiGetFavorites(): Promise<FavItem[]> {
  // 서버에 GET 요청
  const res = await fetch(`${API_BASE}/users/places`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  // 응답이 정상적이지 않으면 에러
  if (!res.ok) throw new Error(`GET /users/places ${res.status}`);
  const data = await res.json(); 

  // 응답에 places 배열이 없으면 빈 배열로 처리
  const arr = Array.isArray(data?.places) ? data.places : [];

  // 서버 데이터 → FavItem 타입으로 변환 후 id가 빈 값이 아닌 것만 필터링
  return arr
    .map((p: any): FavItem => ({
      id: String(p?.id ?? ""),                  // 문자열로 강제 변환
      name: String(p?.name ?? ""),              // 장소 이름
      img: p?.img ?? undefined,                 // 이미지 (없으면 undefined)
      category: p?.category ?? undefined,       // 카테고리
      price: p?.price ?? undefined,             // 가격 정보
      time: p?.time ?? undefined,               // 운영 시간
      lat: typeof p?.lat === "number" ? p.lat : undefined, // 위도
      lon: typeof p?.lon === "number" ? p.lon : undefined, // 경도
      rating: typeof p?.rating === "number" ? p.rating : 0, // 평점 (숫자 아니면 0)
    }))
    .filter((it: FavItem) => it.id !== "");
}

/** 즐겨찾기 추가 또는 수정 */
export async function apiAddOrUpdateFavorite(place: FavItem): Promise<void> {
  // place.id 없으면 잘못된 요청
  if (!place || !place.id) throw new Error("Invalid payload: place.id is required");

  // 서버에 POST 요청 (place 데이터 전달)
  const res = await fetch(`${API_BASE}/users/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ place }),
  });

  // 실패 시 에러
  if (!res.ok) throw new Error(`POST /users/places ${res.status}`);
}

/** 특정 id의 즐겨찾기 삭제 */
export async function apiDeleteFavoriteById(placeId: string): Promise<void> {
  if (!placeId) return; // id가 없으면 그냥 종료

  const res = await fetch(`${API_BASE}/users/places/${encodeURIComponent(placeId)}`, {
    method: "DELETE",
  });

  // 정상 응답도 아니고 204(No Content)도 아니면 실패 처리
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE /users/places/${placeId} ${res.status}`);
  }
}

/** 서버에 있는 모든 즐겨찾기 항목 삭제 */
export async function apiDeleteAllCurrentOnServer(): Promise<void> {
  // 1) 먼저 서버에서 현재 리스트 가져오기
  let list: any[] = [];
  try {
    const res = await fetch(`${API_BASE}/users/places`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      list = Array.isArray(data?.places) ? data.places : [];
    }
  } catch {
    // 서버가 죽었으면 그냥 종료
    return;
  }

  // 2) 병렬 삭제 시도
  //    (id가 문자열/숫자 두 가지 형태일 수 있으므로 2단계 시도)
  const results = await Promise.allSettled(
    list.map((p) => {
      const rawId = p?.id;
      if (rawId === undefined || rawId === null) return Promise.resolve();

      const asString = String(rawId);
      const asNumber = Number(rawId);

      // 1차: 문자열 id로 삭제 요청
      return fetch(`${API_BASE}/users/places/${encodeURIComponent(asString)}`, { method: "DELETE" })
        .then((r) => {
          if (r.ok || r.status === 204) return; // 성공 시 종료

          // 2차: 숫자로 변환한 id로 다시 삭제 요청
          if (!Number.isNaN(asNumber)) {
            return fetch(`${API_BASE}/users/places/${encodeURIComponent(String(asNumber))}`, { method: "DELETE" })
              .then((r2) => {
                if (!r2.ok && r2.status !== 204) {
                  return Promise.reject(new Error(`DELETE failed for id ${rawId}`));
                }
              });
          } else {
            // 숫자 변환 불가 → 실패 처리
            return Promise.reject(new Error(`DELETE failed for id ${rawId}`));
          }
        });
    })
  );

  // 3) 삭제 실패한 항목이 있으면 에러 던지기
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length) throw new Error(`일부 삭제 실패(${failed.length}/${results.length})`);
}

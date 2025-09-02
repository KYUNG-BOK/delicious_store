import type { FavItem } from "./types";

// 로컬스토리지에 저장할 때 사용할 key
export const LS_KEY = "fav:restaurants:v1";

// 즐겨찾기 목록이 갱신될 때 발생시킬 이벤트 이름
export const EVT = "fav:update";

/** 
 * 안전하게 localStorage에서 값 가져오기 
 * (서버사이드 렌더링 환경(window 없는 경우)도 고려)
 */
export function safeGetItem(key: string) {
  try { 
    if (typeof window === "undefined") return null; // 브라우저가 아니면 null
    return window.localStorage.getItem(key);        // 정상적인 경우 값 반환
  } catch { 
    return null; // 에러 시 null 반환
  }
}

/** 
 * 안전하게 localStorage에 값 저장하기 
 */
export function safeSetItem(key: string, value: string) {
  try { 
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // 에러 발생 시 무시
  }
}

/** 
 * 로컬스토리지에서 FavItem[] 불러오기 
 */
export function loadFromStorage(): FavItem[] {
  try {
    const raw = safeGetItem(LS_KEY); // 저장된 raw string 가져오기
    if (!raw) return [];             // 값이 없으면 빈 배열
    const parsed = JSON.parse(raw);  // JSON 문자열 → JS 객체
    return Array.isArray(parsed) ? parsed : []; // 배열이면 반환, 아니면 빈 배열
  } catch { 
    return []; // 파싱 실패 시 빈 배열
  }
}

/** 
 * 즐겨찾기 목록(FavItem[])을 로컬스토리지에 저장 
 * + 저장 직후 커스텀 이벤트(fav:update) 발생시켜서 UI 갱신 트리거
 */
export function saveToStorage(items: FavItem[]) {
  safeSetItem(LS_KEY, JSON.stringify(items));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVT));
  }
}

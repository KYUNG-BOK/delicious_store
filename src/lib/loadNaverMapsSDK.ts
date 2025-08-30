declare global {
  interface Window {
    naver?: any;
    __naverMapReady?: Promise<void>;
  }
}

/**
 * 네이버 지도 JS SDK를 로드하기
 * 환경변수: VITE_NAVER_ID 사용
 */
export function loadNaverMapsSDK(): Promise<void> {
  if (window.naver?.maps) return Promise.resolve();

  if (window.__naverMapReady) return window.__naverMapReady;

  window.__naverMapReady = new Promise<void>((resolve, reject) => {
    const clientId = import.meta.env.VITE_NAVER_ID as string;
    if (!clientId) {
      reject(new Error("VITE_NAVER_ID 누락"));
      return;
    }

    const script = document.createElement("script");
    script.defer = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("네이버 지도 SDK 로드 실패"));
    document.head.appendChild(script);
  });

  return window.__naverMapReady;
}
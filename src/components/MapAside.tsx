import { useEffect, useRef, useState } from "react";
import { useGeolocation } from "../lib/useGeolocation";
import { loadNaverMapsSDK } from "../lib/loadNaverMapsSDK";
import { reverseGeocodeKOR } from "../lib/reverseGeocodeKOR";

type AddrStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; address: string }
  | { state: "empty" }                      
  | { state: "error"; message: string }; 

export default function MapAside() {
  const mapRef = useRef<HTMLDivElement>(null);

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const [addr, setAddr] = useState<AddrStatus>({ state: "idle" });

 const { status, coords, message, code } = ((): any => {
    const state = useGeolocation(
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
    if (state.status === "error") {
      return { status: "error", code: state.code, message: state.message };
    }
    if (state.status === "success") {
      return {
        status: "success",
        coords: { lat: state.coords.latitude, lon: state.coords.longitude },
      };
    }
    return state;
  })();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadNaverMapsSDK();
        if (cancelled || !mapRef.current) return;
        const initialCenter = new (window as any).naver.maps.LatLng(37.5665, 126.9780); 
        const _map = new (window as any).naver.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 14,
          scaleControl: true,
          logoControl: true,
          mapDataControl: false,
        });
        const _marker = new (window as any).naver.maps.Marker({
          position: initialCenter,
          map: _map,
        });

        setMap(_map);
        setMarker(_marker);
        setSdkError(null);
      } catch (e: any) {
        setSdkError(e?.message ?? "네이버 지도 SDK 로드 실패");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 좌표 들어오면 지도/마커 갱신
  useEffect(() => {
    if (!map || !marker || !coords) return;
    const latlng = new (window as any).naver.maps.LatLng(coords.lat, coords.lon);
    map.setCenter(latlng);
    marker.setPosition(latlng);
  }, [map, marker, coords]);

  // 수동으로 맞추기
  const recenter = () => {
    if (!("geolocation" in navigator) || !map || !marker) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new (window as any).naver.maps.LatLng(
          pos.coords.latitude,
          pos.coords.longitude
        );
        map.setCenter(latlng);
        marker.setPosition(latlng);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 10_000 }
    );
  };

  const refreshAddress = async () => {
    if (!coords) return;
    setAddr({ state: "loading" });
    try {
      const res = await reverseGeocodeKOR(coords.lat, coords.lon);
      if (res.reason === "ok" && res.address) {
        setAddr({ state: "success", address: res.address });
      } else {
        setAddr({ state: "empty" });
      }
    } catch (e: any) {
      setAddr({ state: "error", message: e?.message ?? "주소 변환 실패" });
    }
  };

  return (
    <aside className="lg:sticky lg:top-[76px]">
      <div className="card bg-base-100 text-base-content shadow-md">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h3 className="card-title">현재 내 위치</h3>
            <button className="btn btn-xs btn-outline" onClick={recenter}>
              현재 위치로 이동
            </button>
          </div>

          <p className="text-sm opacity-70">
            브라우저 위치 권한을 허용하면 내 위치에 마커가 표시됩니다.
          </p>

          {/* 지도사이즈 372 × 209에 맞춤 */}
          <div className="rounded-box overflow-hidden mx-auto w-full max-w-[372px]">
            <div
              ref={mapRef}
              className="w-full"
              style={{ height: 209 }}
              aria-label="네이버 지도"
            />
          </div>

        {/* 상태 / 주소 표시 */}
          <div className="mt-3 space-y-1 text-sm">
            {sdkError && <div className="text-error">지도 오류: {sdkError}</div>}

            {status === "loading" && <div>📡 현재 위치 가져오는 중…</div>}
            {status === "error" && (
              <div className="text-warning">
                위치 오류: {code} — {message || "가져올 수 없어요"}
              </div>
            )}

            {/* ✅ 주소가 출력되는 부분 */}
            {status === "success" && (
              <div className="mt-2">
                <div className="text-xs uppercase opacity-60 mb-1">내 현재 위치</div>

                {addr.state === "idle" && (
                  <div className="opacity-70">대기 중…</div>
                )}
                {addr.state === "loading" && (
                  <div className="opacity-70 animate-pulse">주소 변환 중입니다…</div>
                )}
                {addr.state === "success" && (
                  <div className="font-medium break-words">
                    📍 {addr.address}
                  </div>
                )}
                {addr.state === "empty" && (
                  <div className="opacity-70">주소를 찾지 못했어요.</div>
                )}
                {addr.state === "error" && (
                  <div className="text-error">
                    오류: {addr.message}
                  </div>
                )}

                <div className="mt-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={refreshAddress}
                    disabled={addr.state === "loading" || !coords}
                  >
                    주소 새로고침
                  </button>
                </div>

                {/* 좌표도 표시데쓰 */}
                {coords && (
                  <div className="text-xs opacity-60 mt-1">
                    (좌표: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)})
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-control mt-3">
            <label className="label cursor-pointer justify-start gap-3">
              <input type="checkbox" className="checkbox" />
              <span className="label-text">맵과 리스트 동기화</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
import { useEffect, useRef, useState } from "react";

// 위치 상태(GeoState) 정의
// - idle: 아직 요청 안 한 상태
// - loading: 위치 정보를 불러오는 중
// - success: 성공적으로 위치 정보를 얻음
// - error: 오류 발생 (코드 + 메시지 포함)
type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coords: GeolocationCoordinates }
  | { status: "error"; code: number; message: string };

// 👉 커스텀 훅: useGeolocation
// - opts: 위치 옵션 (정확도, 타임아웃, 캐싱 시간)
// - maxRetries: 실패했을 때 재시도 횟수
export function useGeolocation(
  opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  maxRetries = 5
) {
  // 위치 상태 관리
  const [state, setState] = useState<GeoState>({ status: "idle" });

  // 몇 번 재시도했는지 기록하는 ref
  const retryRef = useRef(0);

  // watchPosition()의 ID 저장 (→ 나중에 중단할 때 필요)
  const watchIdRef = useRef<number | null>(null);

  // 취소 여부를 기록하는 ref (컴포넌트 언마운트 시 사용)
  const cancelled = useRef(false);

  useEffect(() => {
    // 1) 브라우저가 geolocation API를 지원하지 않는 경우
    if (!("geolocation" in navigator)) {
      setState({ status: "error", code: -1, message: "이 브라우저는 위치 정보를 지원하지 않습니다." });
      return;
    }

    cancelled.current = false;
    setState({ status: "loading" }); // 위치 요청 시작 → 로딩 상태

    // 2) watchPosition으로 위치 변화를 실시간으로 감시
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (cancelled.current) return;
        setState({ status: "success", coords: pos.coords }); // 성공 시 좌표 저장
      },
      _ => {
        if (cancelled.current) return;
        // 오류는 아래 attempt()에서 별도로 처리
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // watchPosition 정리용 함수
    const clearWatch = () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    // 3) 현재 위치를 한 번만 가져오는 함수 (재시도 포함)
    const attempt = () => {
      if (cancelled.current) return;

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled.current) return;
          setState({ status: "success", coords: pos.coords }); // 성공 시 상태 업데이트
          clearWatch(); // watchPosition 중단 (한 번만 필요하므로)
        },
        err => {
          if (cancelled.current) return;

          // 위치를 가져올 수 없음 (예: GPS 신호 없음)
          // → 재시도 가능하면 일정 시간 후 다시 실행
          if (err.code === err.POSITION_UNAVAILABLE && retryRef.current < maxRetries) {
            const delay = Math.min(2000 * 2 ** retryRef.current, 8000); // 재시도 간격
            retryRef.current += 1;
            setTimeout(attempt, delay);
          } else {
            // 더 이상 재시도 불가 → 에러 상태로 저장
            setState({ status: "error", code: err.code, message: err.message });
            clearWatch();
          }
        },
        opts // 옵션 적용 (정확도/타임아웃/캐싱)
      );
    };

    attempt(); // 처음 시도 실행

    // 4) 10초 후에는 watchPosition 강제로 중단 (너무 오래 켜져 있지 않게)
    const stopWatchTimer = setTimeout(clearWatch, 10000);

    // 5) 정리(clean-up)
    // - 컴포넌트 언마운트 시 실행
    // - watchPosition 중단 + 타이머 제거
    return () => {
      cancelled.current = true;
      clearTimeout(stopWatchTimer);
      clearWatch();
    };
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge, maxRetries]);

  // 최종 상태 반환 (idle / loading / success / error)
  return state;
}

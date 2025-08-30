import { useEffect, useRef, useState } from "react";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; coords: GeolocationCoordinates }
  | { status: "error"; code: number; message: string };

export function useGeolocation(
  opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  maxRetries = 5
) {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const retryRef = useRef(0);
  const watchIdRef = useRef<number | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", code: -1, message: "Geolocation not supported" });
      return;
    }

    cancelled.current = false;
    setState({ status: "loading" });

    // 1) 10초 동안 watchPosition으로 “워밍업”
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        if (cancelled.current) return;
        setState({ status: "success", coords: pos.coords });
      },
      err => {
        // PERMISSION_DENIED(1)는 여기서도 올 수 있음
        if (cancelled.current) return;
        // watch에서 나는 에러는 무시하고 아래 getCurrentPosition 재시도에 맡김
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    const clearWatch = () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    const attempt = () => {
      if (cancelled.current) return;

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled.current) return;
          setState({ status: "success", coords: pos.coords });
          clearWatch();
        },
        err => {
          if (cancelled.current) return;

          if (err.code === err.POSITION_UNAVAILABLE && retryRef.current < maxRetries) {
            const delay = Math.min(2000 * 2 ** retryRef.current, 8000);
            retryRef.current += 1;
            setTimeout(attempt, delay);
          } else {
            setState({ status: "error", code: err.code, message: err.message });
            clearWatch();
          }
        },
        opts
      );
    };

    attempt();

    const stopWatchTimer = setTimeout(clearWatch, 10000);

    return () => {
      cancelled.current = true;
      clearTimeout(stopWatchTimer);
      clearWatch();
    };
  }, [opts.enableHighAccuracy, opts.timeout, opts.maximumAge, maxRetries]);

  return state;
}
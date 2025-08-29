import React, { useEffect, useRef, useState } from "react";
import type { Restaurant } from "../types";
import { motion } from "framer-motion";
import { reverseGeocodeKOR } from "../lib/reverseGeocodeKOR";

type Props = {
  open: boolean;
  onClose: () => void;
  item?: Restaurant | null;
};

export default function DetailModal({ open, onClose, item }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // 역지오코딩 상태
  const [address, setAddress] = useState<string | null>(null);
  const [rgLoading, setRgLoading] = useState(false);
  const [rgError, setRgError] = useState<string | null>(null);

  // 1) dialog 동기화
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();

    const handleClose = () => onClose?.();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [open, onClose]);

  // 2) SDK 초기화 (placeholder)
  useEffect(() => {
    if (!open || !item?.lat || !item?.lon) return;
    // SDK 초기화
  }, [open, item?.lat, item?.lon]);

  // 3) 네이버 역지오코딩
  useEffect(() => {
    if (!open || !item?.lat || !item?.lon) {
      setAddress(null);
      setRgError(null);
      setRgLoading(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setRgLoading(true);
        setRgError(null);

        const { address: addr, reason } = await reverseGeocodeKOR(
          item.lat!,
          item.lon!
        );

        if (reason === "ok" && addr) {
          setAddress(addr);
        } else if (reason === "no_results") {
          setAddress(null);
          setRgError("주소 결과 없음");
        } else {
          setAddress(null);
          setRgError("주소를 불러올 수 없어요");
        }
      } catch (e: any) {
        if (!controller.signal.aborted) {
          setAddress(null);
          setRgError(e?.message ?? "주소를 불러올 수 없어요");
        }
      } finally {
        if (!controller.signal.aborted) setRgLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open, item?.lat, item?.lon]);

  if (!item) return null;

  const mapLink =
    item.lat && item.lon
      ? `https://maps.google.com/?q=${item.lat},${item.lon}`
      : undefined;

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box bg-base-100 text-base-content max-w-2xl p-0">
        {/* 헤더: 고정 */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-4 bg-base-100">
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm opacity-70">
              {item.category} · {item.price} · {item.time}
            </p>
          </div>
        </div>

        {/* 본문: 스크롤 영역 */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {/* 이미지 */}
          <figure className="rounded-box overflow-hidden">
            <motion.img
              src={item.img}
              alt={(item as any).alt || item.name}
              className="w-full h-80 object-cover"
              initial={{ scale: 1.02, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            />
          </figure>

          {/* 설명 */}
          {(item as any).desc && (
            <p className="text-sm leading-relaxed">{(item as any).desc}</p>
          )}

          {!!item.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <div key={t} className="badge badge-outline">
                  #{t}
                </div>
              ))}
            </div>
          )}

          {/* 좌표/주소/지도 */}
          {item.lat && item.lon && (
            <div className="space-y-2">
              <div className="text-xs opacity-70">
                위도 {item.lat.toFixed(4)} · 경도 {item.lon.toFixed(4)}
              </div>
              <div className="text-sm">
                {rgLoading
                  ? "주소 불러오는 중…"
                  : address
                  ? <>📍 {address}</>
                  : rgError
                  ? <>주소를 불러올 수 없어요 · {rgError}</>
                  : null}
              </div>
              <div className="aspect-video rounded-box bg-base-200">
                <iframe
                  title="google-map"
                  src={`https://www.google.com/maps?q=${item.lat},${item.lon}&hl=ko&z=16&output=embed`}
                  width="100%"
                  height="340"
                  className="rounded-box border-0"
                />
              </div>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="link link-primary text-sm mt-2 inline-block"
                >
                  지도 앱으로 열기 ↗
                </a>
              )}
            </div>
          )}
        </div>

        {/* 액션: 고정 */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 p-4 bg-base-100">
          <button className="btn btn-outline" onClick={onClose}>
            닫기
          </button>
          <button className="btn btn-primary">찜하기</button>
        </div>
      </div>

      {/* 바깥 클릭 닫기 */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

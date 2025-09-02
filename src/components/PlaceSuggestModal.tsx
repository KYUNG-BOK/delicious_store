import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type PlaceSuggestion = {
  name: string;
  category: string;
  price?: "0~10000" | "10000~20000" | "20000~30000";
  phone?: string;
  website?: string;
  address?: string;
  lat?: number;
  lon?: number;
  tags?: string[];
  hours?: string;
  img?: string; 
  desc?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PlaceSuggestion) => Promise<void> | void;
};

const spring = { type: "spring" as const, stiffness: 260, damping: 22 };

const categories = [
  "한식","카페","일식","중식","양식","분식","고기/구이","술집","디저트","기타",
];

function isHttpUrl(s?: string) {
  if (!s) return false;
  try { new URL(s); return true; } catch { return false; }
}

export default function PlaceSuggestModal({ open, onClose, onSubmit }: Props) {
  const dlgRef = useRef<HTMLDialogElement>(null);

  // 폼 상태
  const [name, setName] = useState("");
  const [category, setCategory] = useState("한식");
  const [price, setPrice] = useState<"0~10000"|"10000~20000"|"20000~30000"|"">("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lon, setLon] = useState<string>("");
  const [hours, setHours] = useState("");
  const [tags, setTags] = useState("");
  const [img, setImg] = useState("");
  const [desc, setDesc] = useState("");

  // 상태
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 다이얼로그 열고 닫기 동기화
  useEffect(() => {
    const el = dlgRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();

    const onNativeClose = () => onClose?.();
    el.addEventListener("close", onNativeClose);
    return () => el.removeEventListener("close", onNativeClose);
  }, [open, onClose]);

  // 오픈 시 폼 초기화
  useEffect(() => {
    if (!open) return;
    setErr(null);
    setSubmitting(false);
    // 필요시 기존 값 유지하려면 주석 처리
    setName(""); setCategory("한식"); setPrice("");
    setPhone(""); setWebsite(""); setAddress("");
    setLat(""); setLon(""); setHours("");
    setTags(""); setImg(""); setDesc("");
  }, [open]);

  // 유효성 간단 체크
  const errors = useMemo(() => {
    const list: string[] = [];
    if (!name.trim()) list.push("가게 이름은 필수입니다.");
    if (!category) list.push("카테고리를 선택하세요.");
    if (website && !isHttpUrl(website)) list.push("웹사이트 URL 형식이 올바르지 않습니다.");
    if (img && !isHttpUrl(img)) list.push("이미지 URL 형식이 올바르지 않습니다.");
    if (lat && isNaN(Number(lat))) list.push("위도(lat)는 숫자여야 합니다.");
    if (lon && isNaN(Number(lon))) list.push("경도(lon)는 숫자여야 합니다.");
    return list;
  }, [name, category, website, img, lat, lon]);

  // 현재 위치 사용
  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setErr("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return;
    }
    setErr(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLon(String(pos.coords.longitude));
      },
      (e) => setErr(e?.message ?? "위치 정보를 가져올 수 없어요."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const submit = async () => {
    if (errors.length) {
      setErr(errors[0]);
      return;
    }
    setSubmitting(true);
    setErr(null);
    const data: PlaceSuggestion = {
      name: name.trim(),
      category,
      price: (price || undefined) as any,
      phone: phone || undefined,
      website: website || undefined,
      address: address || undefined,
      lat: lat ? Number(lat) : undefined,
      lon: lon ? Number(lon) : undefined,
      hours: hours || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      img: img || undefined,
      desc: desc || undefined,
    };
    try {
      await onSubmit?.(data);
      onClose();
    } catch (e:any) {
      setErr(e?.message ?? "제출 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const mapLink =
    (lat && lon) ? `https://maps.google.com/?q=${lat},${lon}` :
    address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
            : "";

  return (
    <dialog ref={dlgRef} className="modal p-0">
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={spring}
            className="fixed left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2
                       rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h3 className="text-lg font-semibold">혼자 알기엔 너무나 아까운 맛집을 알려주세요.</h3>
              <button
                onClick={onClose}
                className="h-8 px-2 rounded-md bg-slate-800 hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* 폼 */}
            <div className="p-4 grid gap-4 md:grid-cols-2">
              {/* 좌측 */}
              <div className="space-y-3">
                <Field label="가게 이름 *">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={name}
                    onChange={e=>setName(e.target.value)}
                    placeholder="가게 상호를 입력해주세요."
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="카테고리 *">
                    <select
                      className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={category}
                      onChange={e=>setCategory(e.target.value)}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="가격대">
                    <select
                      className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-2 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={price}
                      onChange={e=>setPrice(e.target.value as any)}
                    >
                      <option value="">선택 안 함</option>
                      <option>0~10000</option>
                      <option>10000~20000</option>
                      <option>20000~30000</option>
                    </select>
                  </Field>
                </div>

                <Field label="전화번호">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={phone}
                    onChange={e=>setPhone(e.target.value)}
                    placeholder="가게 전화번호를 입력해주세요."
                  />
                </Field>

                <Field label="웹사이트">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={website}
                    onChange={e=>setWebsite(e.target.value)}
                    placeholder="가게 홈페이지를 입력해주세요."
                  />
                </Field>

                <Field label="영업시간">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={hours}
                    onChange={e=>setHours(e.target.value)}
                    placeholder="예) 11:00 - 21:30 (월휴무)"
                  />
                </Field>

                <Field label="태그(쉼표로 구분)">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={tags}
                    onChange={e=>setTags(e.target.value)}
                    placeholder="예) 혼밥, 어린이메뉴, 넓음"
                  />
                </Field>
              </div>

              {/* 우측 */}
              <div className="space-y-3">
                <Field label="주소">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={address}
                    onChange={e=>setAddress(e.target.value)}
                    placeholder="예시) 서울 마포구 ..."
                  />
                </Field>

                <div className="grid grid-cols-3 gap-3">
                  <Field label="위도(lat)">
                    <input
                      className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={lat}
                      onChange={e=>setLat(e.target.value)}
                      placeholder="위도"
                    />
                  </Field>
                  <Field label="경도(lon)">
                    <input
                      className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      value={lon}
                      onChange={e=>setLon(e.target.value)}
                      placeholder="경도"
                    />
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={useMyLocation}
                      className="h-9 w-full rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                    >
                      현재 위치
                    </button>
                  </div>
                </div>

                <Field label="이미지 URL">
                  <input
                    className="h-9 w-full rounded-md bg-slate-800 border border-slate-700 px-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500"
                    value={img}
                    onChange={e=>setImg(e.target.value)}
                    placeholder="예) https://...jpg"
                  />
                </Field>

                {img && isHttpUrl(img) && (
                  <div className="rounded-lg overflow-hidden border border-slate-700">
                    <img src={img} alt="preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                <Field label="한 줄 소개 / 비고">
                  <textarea
                    rows={3}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    value={desc}
                    onChange={e=>setDesc(e.target.value)}
                    placeholder="예) 김밥이 정말 맛있는 집"
                  />
                </Field>

                {/* 지도 프리뷰 or 링크 */}
                {mapLink && (
                  <div className="space-y-2">
                    <div className="rounded-lg overflow-hidden border border-slate-700">
                      <iframe
                        title="map"
                        src={
                          lat && lon
                            ? `https://www.google.com/maps?q=${lat},${lon}&hl=ko&z=16&output=embed`
                            : `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=ko&z=16&output=embed`
                        }
                        className="w-full h-40 border-0"
                      />
                    </div>
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-400 hover:underline text-xs"
                    >
                      구글 지도에서 열기 ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 에러 영역 */}
            {!!(err || errors.length) && (
              <div className="px-4 pb-2">
                <p className="text-rose-400 text-sm">{err ?? errors[0]}</p>
              </div>
            )}

            {/* 액션 */}
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700">
              <button
                disabled={submitting}
                onClick={onClose}
                className="h-9 rounded-md px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
              >
                취소
              </button>
              <button
                disabled={submitting}
                onClick={submit}
                className="h-9 rounded-md px-4 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "제출 중..." : "제보 제출"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 백드롭 클릭 닫기 */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} aria-label="close backdrop" />
      </form>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      {children}
    </label>
  );
}

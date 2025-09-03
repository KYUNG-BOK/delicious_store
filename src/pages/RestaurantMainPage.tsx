import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import RestaurantCard from "../components/RestaurantCard";
import MapAside from "../components/MapAside";
import FooterBar from "../components/FooterBar";
import { CATEGORIES, type Restaurant, type BEPlace } from "../types";
import { adaptPlace, FALLBACK } from "../lib/adapt";
import DetailModal from "../components/DetailModal";
import { useGeolocation } from "../lib/useGeolocation";
import PlaceSuggestModal from "../components/PlaceSuggestModal";
import type { PlaceSuggestion } from "../components/PlaceSuggestModal";

export default function RestaurantMainPage() {
  const geo = useGeolocation({ enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  const origin =
    geo.status === "success"
      ? { lat: geo.coords.latitude, lon: geo.coords.longitude }
      : undefined;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // 검색/필터 상태
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("전체");
  const [sort, setSort] = useState<"reco" | "rating" | "distance">("reco");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const [places, setPlaces] = useState<Restaurant[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Restaurant | null>(null);

  const [openSuggest, setOpenSuggest] = useState(false);
  const [toast, setToast] = useState<null | { type: "ok" | "err"; msg: string }>(null);


  const openDetail = (item: Restaurant) => {
    setDetailItem(item);
    setDetailOpen(true);
  };
  const closeDetail = () => setDetailOpen(false);


async function submitSuggestion(data: PlaceSuggestion) {
  try {
    // 로컬 임시 저장 (확인용)
    const key = "suggestions:places";
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift({ id: crypto.randomUUID(), createdAt: Date.now(), ...data });
    localStorage.setItem(key, JSON.stringify(arr));

    setToast({ type: "ok", msg: "임시 저장되었어요!" });
  } catch (e: any) {
    setToast({ type: "err", msg: e?.message ?? "제보 제출 중 오류가 발생했어요." });
    throw e;
  } finally {
    setTimeout(() => setToast(null), 2200);
  }
}

  // 데이터 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/places");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: { places: BEPlace[] } = await res.json();
        const adapted = json.places.map((p) => adaptPlace(p, origin));
        if (alive) setPlaces(adapted);
      } catch {
        if (alive) setPlaces(FALLBACK);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [origin]);

  // 필터/정렬
  const filtered = useMemo(() => {
    let list = [...places];
    if (cat !== "전체") list = list.filter((r) => r.category === cat);
    if (q.trim()) {
      const kw = q.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.category.toLowerCase().includes(kw) ||
          r.tags?.some((t) => t.toLowerCase().includes(kw))
      );
    }
    if (onlyOpen) {
      const hour = new Date().getHours();
      list = hour < 18 ? list : list.filter((r) => r.category === "카페");
    }
    switch (sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        list.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      default:
        list.sort((a, b) => b.rating - a.rating * 0.8);
    }
    return list;
  }, [places, q, cat, sort, onlyOpen]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navbar />

      <Hero
        q={q}
        setQ={setQ}
        sort={sort}
        setSort={setSort}
        onlyOpen={onlyOpen}
        setOnlyOpen={setOnlyOpen}
        cat={cat}
        setCat={setCat}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold">추천 맛집</h2>
            <div className="tabs tabs-boxed hidden sm:flex">
              <a className="tab tab-active">전체</a>
              <a className="tab">찜</a>
              <a className="tab">최근 본 곳</a>
            </div>
          </div>

          {/* --- 로딩중 표시하기 --- */}
          {!loaded && (
            <div className="w-full">
              <progress className="progress progress-primary w-full"></progress>
              <p className="mt-2 text-center text-sm text-base-content/70 animate-pulse">
                맛집 데이터를 불러오고 있어요...
              </p>
            </div>
          )}

          {/* --- 결과 없음 --- */}
          {loaded && filtered.length === 0 && (
            <div className="p-6 text-center opacity-70">
              검색 조건에 맞는 맛집이 없어요. 키워드를 바꿔보세요!
            </div>
          )}

          {/* --- 목록/스켈레톤 --- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {loaded
                ? filtered.map((item) => (
                    <RestaurantCard
                      key={item.id}
                      item={item}
                      onDetail={openDetail}
                    />
                  ))
                : Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="card bg-base-100 shadow-md overflow-hidden animate-pulse"
                    >
                      <div className="h-48 skeleton w-full" />
                      <div className="card-body">
                        <div className="skeleton h-5 w-2/3" />
                        <div className="skeleton h-4 w-1/3 mt-2" />
                        <div className="mt-3 flex gap-2">
                          <div className="skeleton h-6 w-16 rounded-full" />
                          <div className="skeleton h-6 w-20 rounded-full" />
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="skeleton h-4 w-16" />
                          <div className="flex gap-2">
                            <div className="skeleton h-8 w-16 rounded-lg" />
                            <div className="skeleton h-8 w-16 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </AnimatePresence>
          </div>
        </section>

        <MapAside />
      </main>

      {/* FAB */}
      <div className="fixed bottom-24 right-5 lg:right-10 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="btn btn-primary rounded-full shadow-lg"
          onClick={() => setOpenSuggest(true)}
        >
          + 장소 제보
        </motion.button>
      </div>

      <FooterBar />

      {/* 자세히 보기 모달 */}
      <DetailModal 
        open={detailOpen} 
        onClose={closeDetail} 
        item={detailItem} 
      />

      {/* 맛집 제보 모달 */}
      <PlaceSuggestModal
        open={openSuggest}
        onClose={() => setOpenSuggest(false)}
        onSubmit={submitSuggestion}
      />

      {/* Toast 알림 설정*/}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="suggest-toast"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={`fixed bottom-6 right-6 z-[60] rounded-md px-4 py-2 shadow-lg
            ${toast.type === "ok" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
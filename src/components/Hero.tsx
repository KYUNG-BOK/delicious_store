import React from "react";
import { motion } from "framer-motion";
import { fadeIn, spring } from "../lib/animations";
import { CATEGORIES } from "../types";

type Props = {
  q: string;        // 검색어 상태
  setQ: (v: string) => void;        // 검색어 변경
  sort: "reco" | "rating" | "distance";     // 정렬
  setSort: (v: "reco" | "rating" | "distance") => void;
  onlyOpen: boolean;        // 영업중만 보기
  setOnlyOpen: (v: boolean) => void;        // 영업중 보기 토글 함수
  cat: (typeof CATEGORIES)[number];     // 현재 선택된 카테고리
  setCat: (c: (typeof CATEGORIES)[number]) => void;         // 카테고리 변경
};

export default function Hero({
  q, setQ, sort, setSort, onlyOpen, setOnlyOpen, cat, setCat,
}: Props) {
  return (
    <section
      className="hero min-h-[44vh]"
      style={{
        backgroundImage:
          "url(/images/hero.jpeg?q=80&w=1600&auto=format&fit=crop)",
      }}
    >
      <div className="hero-overlay bg-black/60" />
      <div className="hero-content text-center">
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <h1 className="mb-3 text-4xl sm:text-5xl font-extrabold text-white drop-shadow">
            오늘은 뭐 먹을까유?
          </h1>
          <p className="mb-6 text-white/90 drop-shadow">근처 맛집을 한눈에 👀</p>

          {/* 검색 카드 (UI 그대로) */}
          <div className="card bg-base-100 text-base-content shadow-2xl border border-base-300">
            <div className="card-body gap-3">
              <div className="join w-full">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="메뉴, 가게명, 해시태그 검색"
                  className="input input-bordered join-item w-full bg-base-100 text-base-content placeholder:text-base-content/60"
                />
                <select
                  className="select select-bordered join-item w-36 bg-base-100 text-base-content"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Props["sort"])}
                  aria-label="정렬"
                >
                  <option value="reco">추천순</option>
                  <option value="rating">평점순</option>
                  <option value="distance">거리순</option>
                </select>
                <button className="btn btn-primary join-item">검색</button>
              </div>

              <label className="label cursor-pointer justify-center gap-2">
                <span className="label-text text-base-content">영업중만 보기</span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                />
              </label>

              <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {CATEGORIES.map((c) => (
                    <motion.button
                      key={c}
                      onClick={() => setCat(c)}
                      className={`btn btn-xs sm:btn-sm rounded-full ${
                        cat === c ? "btn-primary" : "btn-outline border-base-300"
                      }`}
                      variants={fadeIn}
                      initial="hidden"
                      animate="show"
                      transition={{ duration: 0.2 }}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ErrorKind = "404" | "network" | "geo" | "500" | "custom";

type Props = {
  kind?: ErrorKind;
  title?: string;
  message?: string;
  onRetry?: () => void;
  homeHref?: string;
  details?: string;
  contactHref?: string;
};

const spring = { type: "spring" as const, stiffness: 200, damping: 22, mass: 0.7 };

export default function ErrorPage({
  kind = "custom",
  title,
  message,
  onRetry,
  homeHref = "/",
  details,
  contactHref = "mailto:kyeongbok_0627@kakao.com?subject=%5BOZ%20Eats%5D%20오류 문의",
}: Props) {
  const preset = getPreset(kind);
  const heading = title ?? preset.title;
  const desc = message ?? preset.message;

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!onRetry) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRetry]);

  const accent =
    kind === "404" ? "primary" :
    kind === "network" ? "secondary" :
    kind === "geo" ? "accent" :
    kind === "500" ? "warning" : "primary";

  const solidBtn = `btn btn-${accent} text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`;
  const outlineBtn = `btn btn-outline border-white/40 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`;
  const ghostBtn = `btn btn-ghost text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60`;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden text-white" data-theme="dark">
      <div
        className="absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% -10%, rgba(82,91,255,0.18), transparent), radial-gradient(900px 900px at 100% 120%, rgba(255,96,176,0.15), transparent), linear-gradient(180deg, #0a0e17 0%, #0a0d14 70%, #080b10 100%)",
        }}
      />
      {/* dotted grid */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0",
        }}
      />
      {/* film noise */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6' /%3E%3C/svg%3E\")",
        }}
      />

      <div className="container mx-auto px-4">
        <div className="grid min-h-[100dvh] place-items-center py-10">
          {/* ===== Card (glass + gradient ring) ===== */}
          <motion.div
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={spring}
            className="relative w-full max-w-xl"
          >
            {/* gradient ring wrapper */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-70 blur-md" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="p-7 sm:p-9 text-center">
                {/* floating emoji */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={spring}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0], rotate: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-2xl"
                    aria-hidden
                  >
                    {preset.emoji}
                  </motion.span>
                </motion.div>

                <h1 className="mt-5 text-3xl sm:text-[2rem] font-extrabold tracking-tight text-white">
                  {heading}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                  {desc}
                </p>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className={solidBtn}
                      title="단축키: R"
                    >
                      다시 시도
                    </button>
                  )}
                  <a href={homeHref} className={outlineBtn}>홈으로</a>
                  <a href={contactHref} className={ghostBtn}>문의하기</a>
                </div>

                {/* Details accordion */}
                {details && (
                  <div className="mt-4">
                    <button
                      className="link link-hover text-sm text-white/80"
                      onClick={() => setShowDetails(v => !v)}
                    >
                      {showDetails ? "세부 정보 숨기기" : "세부 정보 보기"}
                    </button>
                    {showDetails && (
                      <pre className="mt-2 max-h-48 overflow-auto rounded-2xl bg-black/40 border border-white/10 p-3 text-left text-xs text-white/80">
                    {details}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* subtle bottom line */}
            <motion.div
              aria-hidden
              className="mx-auto mt-6 h-px w-48 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 192, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getPreset(kind: ErrorKind) {
  switch (kind) {
    case "404":
      return {
        emoji: "🔍",
        title: "페이지를 찾을 수 없어요",
        message: "요청하신 페이지가 사라졌거나 주소가 바뀌었을 수 있어요.",
      };
    case "network":
      return {
        emoji: "📡",
        title: "네트워크에 연결할 수 없어요",
        message: "연결 상태를 확인하고 다시 시도해 주세요.",
      };
    case "geo":
      return {
        emoji: "📍",
        title: "위치 정보를 가져올 수 없어요",
        message: "브라우저 권한이나 신호 상태를 확인한 뒤 다시 시도해 주세요.",
      };
    case "500":
      return {
        emoji: "💥",
        title: "문제가 발생했어요",
        message: "알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
      };
    default:
      return {
        emoji: "✨",
        title: "무언가 잘못됐어요",
        message: "잠깐만요! 지금 상황을 정리하고 있어요.",
      };
  }
}

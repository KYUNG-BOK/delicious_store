import React from "react";

export default function BottomNav() {
  return (
    <div className="btm-nav lg:hidden bg-neutral text-neutral-content">
      <button className="active">
        <span>🏠</span>
        <span className="btm-nav-label">홈</span>
      </button>
      <button>
        <span>⭐</span>
        <span className="btm-nav-label">찜</span>
      </button>
      <button>
        <span>👤</span>
        <span className="btm-nav-label">내 정보</span>
      </button>
    </div>
  );
}

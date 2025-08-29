import React from "react";

export default function Navbar() {
  return (
    <div className="navbar sticky top-0 z-50 bg-neutral text-neutral-content shadow-md border-b border-neutral">
      <div className="flex-1">
        <span className="btn btn-ghost text-xl">COCO Eats</span>
      </div>
      <div className="flex-none gap-2">
        <button className="btn btn-ghost btn-sm">로그인</button>
        <button className="btn btn-primary btn-sm">내 장소 추가</button>
      </div>
    </div>
  );
}

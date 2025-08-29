import React from "react";

export default function MapAside() {
  return (
    <aside className="lg:sticky lg:top-[76px]">
      <div className="card bg-base-100 text-base-content shadow-md">
        <div className="card-body">
          <h3 className="card-title">지도로 보기</h3>
          <p className="text-sm opacity-70">
            지도를 어떻게 넣어야되나, 막막하네요
          </p>
          <div className="aspect-video rounded-box bg-base-200" />
          <div className="form-control">
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

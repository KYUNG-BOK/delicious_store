import React from "react";

//별점관리

export default function RatingStars({ value, name }: { value: number; name: string }) {
  const rounded = Math.round(value);
  return (
    <div className="rating rating-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <input
          key={i}
          type="radio"
          name={`rating-${name}`}
          className={`mask mask-star-2 ${i + 1 <= rounded ? "bg-amber-400" : "bg-base-300"}`}
          aria-label={`별점 ${i + 1}`}
          readOnly
        />
      ))}
    </div>
  );
}

import { useState } from "react";
import FavoritesModal from "./FavoritesModal";

export default function Navbar() {
  const [openFav, setOpenFav] = useState(false);

  return (
    <>
    <div className="navbar sticky top-0 z-50 bg-neutral text-neutral-content shadow-md border-b border-neutral">
      <div className="flex-1">
        <span className="btn btn-ghost text-xl">COCO Eats</span>
      </div>
      <div className="flex-none gap-2">
        <button className="btn btn-ghost btn-sm">로그인</button>
        <button
            className="btn btn-primary btn-sm"
            onClick={() => setOpenFav(true)}
            aria-haspopup="dialog"
            aria-expanded={openFav}
            aria-controls="favorites-modal"
          >
            맛찜 확인하기
        </button>      
        </div>
    </div>
      <FavoritesModal open={openFav} onClose={() => setOpenFav(false)}/>
    </>
  );
}

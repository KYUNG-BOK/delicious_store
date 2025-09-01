import { useEffect, useRef } from "react";
import FavoritesSection from "./FavoritesSection";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FavoritesModal({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();

    const handleClose = () => onClose?.();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [open, onClose]);

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box max-w-3xl bg-base-100 text-base-content">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">내가 찜한 맛집</h3>
          <button className="btn btn-sm btn-ghost" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <FavoritesSection />
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn btn-outline" onClick={onClose}>닫기</button>
        </div>
      </div>

      {/* 외부 영역 클릭 시 닫기 */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

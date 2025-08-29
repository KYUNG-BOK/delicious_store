export const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "";
export const IMG_BASE =
  (import.meta as any).env?.VITE_IMG_BASE ?? "http://localhost:3000";

export const fetchPlaces = async () => {
  const url = API_BASE ? `${API_BASE}/places` : "/places";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as { places: any[] };
};

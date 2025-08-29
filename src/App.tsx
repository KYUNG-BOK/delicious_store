// 다행이다, 홈페이지 만드는거 연습하고 라이브러리 익히다보니.. 모달도 어렵지가 않네요 ㅠㅠ

import { BrowserRouter, Routes, Route } from "react-router-dom";
import RestaurantMainPage from "./pages/RestaurantMainPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RestaurantMainPage />} />
      </Routes>
    </BrowserRouter>
  );
}
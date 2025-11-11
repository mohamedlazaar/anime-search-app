import { Routes, Route } from "react-router-dom";
import DetailPage from "./pages/DetailPage";
import BioLandingPage from "./pages/Bio";
import MainPage from "./pages/MainPage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/anime/:id" element={<DetailPage />} />
      <Route path='/bio' element={<BioLandingPage />} />
    </Routes>
  );
}

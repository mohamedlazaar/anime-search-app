import { Routes, Route } from "react-router-dom";
import DetailPage from "./pages/DetailPage";
import MainPage from "./pages/MainPage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Aos from 'aos';
import 'aos/dist/aos.css'
import { useEffect } from "react";



export default function App() {
  useEffect(()=>{
    Aos.init({
      easing:'linear',

    })
  })
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/anime/:id" element={<DetailPage />} />
    </Routes>
  );
}

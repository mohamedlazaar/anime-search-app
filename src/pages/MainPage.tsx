import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Slider from "../components/Slider";
import BestAnime from "../components/best_anime";
import Search from "../components/Search";
import PopularAnime from "../components/PopularAnime";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function MainPage() {
  const containerRef = useRef(null);
  const [sliderLoading, setSliderLoading] = useState(true);
  const [bestAnimeLoading, setBestAnimeLoading] = useState(true);
  const [popularAnimeLoading, setPopularAnimeLoading] = useState(true);
  const [pageReady, setPageReady] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  const isPageReady = !sliderLoading && !popularAnimeLoading && !bestAnimeLoading;

  // ✅ Always call useEffect (no conditional placement)
  useEffect(() => {
    const maxLoadTimer = setTimeout(() => setPageReady(true), 2000);

    if (isPageReady) {
      setPageReady(true);
      clearTimeout(maxLoadTimer);
    }

    return () => clearTimeout(maxLoadTimer);
  }, [isPageReady]);

  const handleToggleSearch = () => setIsSearch(!isSearch);

  // ✅ Always call useGSAP (but guard logic inside it)


  // ✅ Conditional rendering happens *after* all hooks
  if (!pageReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>Loading Anime App...</p>
          <div
            style={{
              marginTop: "20px",
              fontSize: "3rem",
              animation: "spin 1s linear infinite",
            }}
          >
            ⏳
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="container" ref={containerRef}>
      <Header isSearch={handleToggleSearch} />
      {isSearch && <Search isOpen={isSearch} onClose={() => setIsSearch(false)} />}
      <Slider type="tv" onLoadingChange={setSliderLoading} />
      <PopularAnime type="movie" fadePosition='fade-right' />
      <PopularAnime type="tv" fadePosition='fade-left' />
      <BestAnime type="movie" onLoadingChange={setBestAnimeLoading} containerRef={containerRef}  />
    </div>
  );
}

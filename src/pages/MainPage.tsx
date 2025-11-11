import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Slider from "../components/Slider";
import BestAnime from "../components/best_anime";
import Search from "../components/Search"; // Import Search component
import PopularAnime from "../components/PopularAnime";
import {ReactLenis, useLenis} from 'lenis/react'


export default function MainPage() {
  // const lenis:any = useLenis(({scroll:any})=>{})
  // const  containerRef = useRef(null)
  const [sliderLoading, setSliderLoading] = useState(true);
  const [bestAnimeLoading, setBestAnimeLoading] = useState(true);
  const [popularAnimeLoading, setPopularAnimeLoading] = useState(true)
  const [pageReady ,setPageReady]= useState(false)
  const [isSearch, setIsSearch] = useState(false); // Toggle state

const isPageReady = !sliderLoading && !bestAnimeLoading && !popularAnimeLoading;
  // ✅ Initial page load - wait for all components
  useEffect(() => {
    // Set a maximum loading time of 5 seconds as fallback
    const maxLoadTimer = setTimeout(() => {
      setPageReady(true);
    }, 8000);

    
    // Check if all components are loaded
    if (isPageReady) {
      setPageReady(true);
      clearTimeout(maxLoadTimer);
    }
    return () => clearTimeout(maxLoadTimer);
  }, [isPageReady]);


  const handleToggleSearch = () => {
    setIsSearch(!isSearch);
  };
      // ✅ Show loading until all components are ready
    if (!pageReady) {
        return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '1.5rem'
        }}>
            <div style={{ textAlign: 'center' }}>
            <p>Loading Anime App...</p>
            <div style={{
                marginTop: '20px',
                fontSize: '3rem',
                animation: 'spin 1s linear infinite'
            }}>
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
    // <ReactLenis root>
    <div className="container"  >
      <Header isSearch={handleToggleSearch} />
      {/* Conditionally render Search component */}
      {isSearch && <Search isOpen={isSearch} onClose={() => setIsSearch(false)} />}
      <Slider type="tv" onLoadingChange={setSliderLoading} />
      <PopularAnime type='movie' />
      <PopularAnime type='tv'/>
      <BestAnime type="movie" onLoadingChange={setBestAnimeLoading}  />
    </div>
    // </ReactLenis>
  );
}

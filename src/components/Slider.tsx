import { useEffect, useState, useRef, useCallback } from "react";
import '../style/slider.css';
import { Link } from "react-router-dom";

const Slider = (type:any) => {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);
  const autoNextRef = useRef<any>(null);
  
  const timeRunning = 400;
  const timeAutoNext = 10000;

  // Fetch anime data
useEffect(() => {
  const controller = new AbortController();
    setLoading(true)
  // ✅ FIXED: Sort by highest rating and add minimum vote count
  const url = 'https://api.themoviedb.org/3/discover/tv?include_adult=true&page=1&with_origin_country=JP&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100';
  
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
      accept: 'application/json',
    },
    signal: controller.signal
  };

  fetch(url, options)
    .then((res) => {
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return res.json();
    })
    .then((json) => {
      
      const filteredAnime = json.results.filter((anime: any) => {
        return (
          anime.backdrop_path &&
          anime.poster_path &&
          (anime.name || anime.original_name) &&
          anime.overview
        );
      });
      setAnimeList(filteredAnime);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch anime data');
      }
    })
    .finally(() => setLoading(false));

  return () => controller.abort();
}, []);


  const showSlider = useCallback((type: 'next' | 'prev') => {
    if (!carouselRef.current || animeList.length === 0) return;

    carouselRef.current.classList.add(type);

    setCurrentIndex(prevIndex => {
      if (type === 'next') {
        return (prevIndex + 1) % animeList.length;
      } else {
        return prevIndex === 0 ? animeList.length - 1 : prevIndex - 1;
      }
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      carouselRef.current?.classList.remove('next', 'prev');
    }, timeRunning);

    if (autoNextRef.current) clearTimeout(autoNextRef.current);
    autoNextRef.current = setTimeout(() => {
      showSlider('next');
    }, timeAutoNext);
  }, [animeList.length]);

  useEffect(() => {
    if (animeList.length === 0) return;

    autoNextRef.current = setTimeout(() => {
      showSlider('next');
    }, timeAutoNext);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
    };
  }, [animeList.length, showSlider]);

  const getVisibleSlides = () => {
    if (animeList.length === 0) return [];
    const slides = [];
    const totalSlides = animeList.length;
    
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % totalSlides;
      slides.push(animeList[index]);
    }
    return slides;
  };

  const getVisibleThumbnails = () => {
    if (animeList.length === 0) return [];
    const thumbnails = [];
    const totalSlides = animeList.length;
    
    for (let i = 0; i < Math.min(5, totalSlides); i++) {
      const index = (currentIndex + i) % totalSlides;
      thumbnails.push(animeList[index]);
    }
    return thumbnails;
  };

  if (loading) return <div className="loading">Loading best anime...</div>;
  if (error) return <div className="error">Error: {error}</div>;


  const visibleSlides = getVisibleSlides();
  const visibleThumbnails = getVisibleThumbnails();

  return (
    <div className="carousel" ref={carouselRef}>
      <div className="list">
        {visibleSlides.map((anime, idx) => (
          <div 
            className={`item ${idx === 0 ? 'active' : ''}`} 
            key={`${anime.id}-${idx}`}
          >
            <img 
              src={`https://image.tmdb.org/t/p/original${anime.backdrop_path}`} style={{ background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3))'}}
              alt={anime.original_title || anime.title || 'Anime'}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/1920x1080?text=No+Image';
              }}
            />
            <div className="content">
              <p className="anime-category">{anime.original_language?.toUpperCase()}</p>
              <p style={{ fontSize: '20px' }}>{anime.first_air_date || anime.release_date}</p>
              <h2 className="anime-title">{anime.name || anime.original_name || anime.title || anime.original_title}</h2>
                      <p className="anime-synopsis">{anime.overview ? (anime.overview.slice(0, 200) + (anime.overview.length > 200 ? "…" : "")) : "No synopsis"}</p>
                <Link to={`/anime/${anime.id}?type=tv`} style={{ padding: '10px 15px', fontSize:'16px', color:'black', backgroundColor:'#fefefefe', borderRadius:'25px', justifySelf:'start'}}>Click for more</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="thumbnail">
        {visibleThumbnails.map((anime, idx) => (
          <div 
            className={`item ${idx === 0 ? 'active' : ''}`} 
            key={`thumb-${anime.id}-${idx}`}
            onClick={() => {
              const targetIndex = (currentIndex + idx) % animeList.length;
              setCurrentIndex(targetIndex);
            }}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`} 
              alt={anime.name || anime.title || 'Anime'}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Image';
              }}
            />
          </div>
        ))}
      </div>

      <div className="arrows">
        <button 
          id="prev" 
          onClick={() => showSlider('prev')}
          aria-label="Previous slide"
        >
          ←
        </button>
        <button 
          id="next" 
          onClick={() => showSlider('next')}
          aria-label="Next slide"
        >
          →
        </button>
      </div>

      <div className="time"></div>
    </div>
  );
};

export default Slider;

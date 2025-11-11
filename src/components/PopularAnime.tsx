import { useState, useEffect } from 'react';
import SwiperSlider from './SwiperSlider';
import { useMediaQuery } from 'react-responsive';
import '../styles.css'
import { Link } from 'react-router';

const PopularAnime = (type:any) => {
  const [loading, setLoading] = useState(false);
  const [popularAnime, setPopularAnime] = useState([]);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery({maxWidth: 767})
  const isTablet = useMediaQuery({maxWidth: 1024})
   let settings = {
    dots: (isTablet || isMobile) ? true: false,
    infinite: true,
    speed: 500,
    adaptiveHeight: true,
    slidesToShow: isTablet ? 2 : isMobile ? 1 : 5,
    sliderToScroll: 1,
    autoPlay:true,
    initialSlide: 0,
    centerPadding: '50px',
    className:'popular',
    arrows:  isTablet? false : true,
    easing:'linear'

  }


  // ✅ Get total pages from API
  async function getTotalPages() {
    try {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
          accept: 'application/json',
        },
      };

      const res = await fetch(
        `https://api.themoviedb.org/3/${type.type}/popular?region=JP`,
        options
      );

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();
      return json.total_pages;
    } catch (err) {
      console.error('Error fetching total pages:', err);
      return 5; // Fallback to 5 pages if error
    }
  }

  // ✅ Fetch a single page
  async function fetchPage(pageNum: number, signal: AbortSignal) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
        accept: 'application/json',
      },
      signal,
    };

    const url = `https://api.themoviedb.org/3/${type.type}/popular?language=en-US&page=${pageNum}&region=JP`;
    const res = await fetch(url, options);

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  // ✅ Fetch all pages and filter for genre 16
  async function fetchAllPagesWithGenre16(totalPages: number) {
    const controller = new AbortController();
    setLoading(true);

    try {
      // Create array of page numbers
      const pageNumbers = Array.from({ length: 30}, (_, i) => i + 1);

      // Fetch all pages in parallel
      const allResults = await Promise.all(
        pageNumbers.map((pageNum) => fetchPage(pageNum, controller.signal))
      );

      // Flatten all results and combine
      const allMovies = allResults.flatMap((data) => data.results);


      // ✅ Filter for movies with genre_ids containing 16
      const filteredAnime:any = allMovies.filter((movie: any) => {
        return (
          movie.backdrop_path &&
          movie.poster_path &&
          (movie.title || movie.original_title || movie.name) &&
          movie.overview &&
          movie.genre_ids && // Ensure genre_ids exists
          movie.genre_ids.includes(16) // Filter for animation genre (16)
        );
      });
      setPopularAnime(filteredAnime.slice(0, 10));
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error:', err);
        setError(err.message || 'Failed to fetch anime data');
      }
    } finally {
      setLoading(false);
    }
  }

  // ✅ Initialize on component mount
  useEffect(() => {
    const controller = new AbortController();

    const initiate = async () => {
      // First, get total pages
      const totalPages = await getTotalPages();

      // Then fetch all pages and filter
      await fetchAllPagesWithGenre16(totalPages);
    };

    initiate();

    return () => controller.abort();
  }, []);
  if(loading) return (<p>Loading popular anime...</p>)
  if(error) return (<p style={{ color: 'red' }}>Error: {error}</p>)
  return (
     <section style={{ margin: ' auto', width:'90%', position:'relative' ,padding: "2em", minHeight:'50svh' }}>
        <h3 style={{ fontSize: "1.8rem", color: "rgb(59, 98, 198)", marginBottom: '20px' }}>
                POPULAR {type.type.toUpperCase()} LIST
        </h3>
      <div style={{
              
                gap: '15px',
                marginBottom: '40px'
              }}>
        <SwiperSlider  settings={settings}>
            {popularAnime.map((anime: any) => (
             <div key={anime.id} style={{  backgroundColor:'#666666ff !important'}}>
                <img src={`https://image.tmdb.org/t/p/original${anime.backdrop_path || anime.poster_path}`} alt={anime.title || anime.name} style={{width:'100%', height:'60%', objectFit:'cover'}} />
                <div style={{border:'none', marginBottom:'10px', height:'40%'}}>
                    <h3 style={{fontSize:isTablet ? '1rem' : isMobile ? '0.6rem': '1.2rem', marginLeft:'10px'}}>{anime.title || anime.name}</h3>
                    <Link to={`/anime/${anime.id}?type=${type.type}`} style={{color: 'black', backgroundColor:'rgb(59, 98, 198)', alignSelf:'start',borderRadius:'25px' ,padding:'10px 20px',marginLeft:'10px'
                    }}>More Info</Link>                    
                </div>

                {/* Add more details as needed */}
            </div> 
            ))}
        </SwiperSlider>
        </div>
      </section>
  );
};

export default PopularAnime;

import { useState, useEffect } from 'react';
import SwiperSlider from './SwiperSlider';
import { useMediaQuery } from 'react-responsive';
import AnimeCard from './AnimeCard';
import '../style/PopularAnime.css'

interface argumentProps {
  type:string;
  fadePosition: string;
  onLoadingChange: any;
}
const PopularAnime = ({type, fadePosition, onLoadingChange}:argumentProps) => {
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
    slidesToShow: isTablet ? 2 : isMobile ? 1 : 4,
    sliderToScroll: 1,
    autoPlay:true,
    initialSlide: 0,
    centerPadding: '50px',
    className:'popular',
    arrows:  isTablet? false : true,
    easing: 'ease'
  }

  console.log(onLoadingChange)

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
        `https://api.themoviedb.org/3/${type}/popular?region=JP`,
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

    const url = `https://api.themoviedb.org/3/${type}/popular?language=en-US&page=${pageNum}&region=JP`;
    const res = await fetch(url, options);

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  // ✅ Fetch all pages and filter for genre 16
  async function fetchAllPagesWithGenre16(totalPages: number) {
    const controller = new AbortController();
    setLoading(true);
    totalPages= 10
    try {
      // Create array of page numbers
      const pageNumbers = Array.from({ length: totalPages}, (_, i) => i + 1);

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
     <section className='popular_container'  data-aos={fadePosition} data-aos-duration="duration: 100" data-aos-delay='0' data-aos-mirror="true">
        <h3 className='popular_header'>POPULAR {type.toUpperCase()} LIST</h3>
      <div className='popular_slider_container' >
        <SwiperSlider  settings={settings}>
            {popularAnime.map((anime: any) => (
             <AnimeCard key={anime.mal_id} anime={anime} type={type}/>
            ))}
        </SwiperSlider>
        </div>
      </section>
  );
};

export default PopularAnime;

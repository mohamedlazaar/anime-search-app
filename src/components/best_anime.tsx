import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import '../style/BestAnime.css';
import { Link } from 'react-router';
import { useMediaQuery } from 'react-responsive';

gsap.registerPlugin(ScrollTrigger);

interface BestAnimeProp {
  type?: any;
  reff:any;
  onLoadingChange:any;
}

const BestAnime = (containerRef:any) => {
  // const containerRef = useRef<any | null>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isTablet = useMediaQuery({maxWidth: 1024})

    useEffect(() => {
    const controller = new AbortController();

    const fetchAnime = async () => {
      setLoading(true);
      try {
        const url =
          "https://api.themoviedb.org/3/discover/movie?include_adult=true&page=12&with_origin_country=JP&with_genres=16";

        const options = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
            accept: "application/json",
          },
          signal: controller.signal,
        };

        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const json = await res.json();

        const filteredAnime = json.results.filter((anime: any) => {
          return (
            anime.backdrop_path &&
            anime.poster_path &&
            (anime.title || anime.original_title) &&
            anime.overview
          );
        });

        console.log("filteredAnime", filteredAnime.slice(0, 5));
        setAnimeList(filteredAnime.slice(0, 5));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch anime data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();

    return () => controller.abort();
  }, []);
   // ✅ Use useLayoutEffect for ScrollTrigger setup
    useGSAP(() => {
      if (animeList.length === 0) return;
      
      const panels = document.querySelectorAll('.anime-content');
      const totalPanels = panels.length;

      // Wait for images to load, then refresh
      const images = document.querySelectorAll('img');
      let loadedImages = 0;
      
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === images.length) {
              ScrollTrigger.refresh(); // ✅ Recalculate positions
            }
          });
        }
      });

      gsap.set(panels[0], { 
        y: '0%', 
        scale: 1, 
        rotation: 0, 
        transformOrigin: 'center center' 
      });

      for (let i = 1; i < totalPanels; i++) {
        gsap.set(panels[i], { 
          y: '100%', 
          scale: 1, 
          rotation: 0,
          transformOrigin: 'center center' 
        });
      }

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.sticky-cards',
          start:  `bottom bottom`,
          end: `+=${window.innerHeight * totalPanels * 2}`,
          pin: true,
          scrub: 1,
          markers: {startColor:'transparent', endColor:'transparent'},
          invalidateOnRefresh: true, // ✅ Recalculate on refresh
          refreshPriority:1,
        }
      });

      for (let i = 0; i < totalPanels - 1; i++) {
        const currentPanel = panels[i];
        const nextPanel = panels[i + 1];
        const position = i;
        
        scrollTimeline
          .to(currentPanel, {
            scale: 0.5, 
            rotation: 10, 
            duration: 1, 
            delay:.4,
            ease: 'none'
          }, position)
          .to(nextPanel, {
            y: "0%", 
            duration: 1, 
            ease: 'none',
            delay:.5,
          }, position);
      }

      return () => {
        scrollTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }, {  scope:containerRef.current, dependencies: [animeList, loading] });


  useEffect(() => {
    if (!loading && animeList.length > 0) {
      // Give React a moment to paint before measuring
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [loading, animeList]);


  if (loading) return <div className="loading">Loading best anime...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div style={{}} className="best_anime_container" data-aos='fade-right' data-aos-duration="600">
      <section className="sticky-cards" >
        <div className="anime-panel">
          {animeList.map((anime) => (
            <div key={anime.id} className="anime-content"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(https://image.tmdb.org/t/p/original${anime.backdrop_path || anime.poster_path})`
              }}>
              <div className='anime-details'>
                <p className="anime-category">{anime.release_date}</p>
                <h2 className="anime-title">{anime.title || anime.original_title}</h2>
                <p className="anime-synopsis">
                  {anime.overview 
                    ? anime.overview.slice(0, 150) + (anime.overview.length > 150 ? "…" : "")
                    : "No synopsis"}
                </p>
                <Link to={`/anime/${anime.id}?type=movie`}  className='anime_link'>Click for more </Link>
              </div>
            </div>
          ))}
        </div>
      </section>      
    </div>
 


  );
};

export default BestAnime;

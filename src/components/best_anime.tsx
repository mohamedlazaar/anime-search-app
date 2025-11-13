import { useEffect, useState, useRef} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import '../style/BestAnime.css';
import { Link } from 'react-router';
import { useMediaQuery } from 'react-responsive';


gsap.registerPlugin(ScrollTrigger);


const BestAnime = (type:any) => {
  const containerReff = useRef<any | null>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({maxWidth: 767})
  const [error, setError] = useState<string | null>(null);
 window.addEventListener("load", () => ScrollTrigger.refresh());

    useEffect(() => {
    console.log(type)
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
  if (totalPanels === 0) return;

  // ensure panels are initially positioned
  gsap.set(panels[0], { y: '0%', scale: 1, rotation: 0, transformOrigin: 'center center' });
  for (let i = 1; i < totalPanels; i++) {
    gsap.set(panels[i], { y: '100%', scale: 1, rotation: 0, transformOrigin: 'center center' });
  }

  // Wait for images to load, then refresh measurements
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  const handleImageLoaded = () => {
    loadedImages++;
    if (loadedImages >= images.length) {
      // give browser a tiny moment then refresh
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  };
  if (images.length === 0) {
    // still refresh once so measurements are correct
    requestAnimationFrame(() => ScrollTrigger.refresh());
  } else {
    images.forEach((img) => {
      if ((img as HTMLImageElement).complete) {
        handleImageLoaded();
      } else {
        img.addEventListener('load', handleImageLoaded, { once: true });
        img.addEventListener('error', handleImageLoaded, { once: true });
      }
    });
  }

  // compute end dynamically using a function — ensures accurate value on refresh/resize
  const computeEnd = () => {
    // base multiplier controls how long the scroll scrub is:
    // increase slightly on mobile to account for smaller viewport / touch momentum
    const multiplier = window.innerWidth <= 768 ? 2.2 : 2.5;
    // at minimum allow at least one viewport height for scrubbing
    return `+=${Math.max(window.innerHeight * totalPanels * multiplier, window.innerHeight * 1.2)}`;
  };

  // If document doesn't have enough height, append a spacer to create scroll distance.
  // This is a safe fallback for small pages (only created when needed).
  let spacer: HTMLDivElement | null = null;
  const ensureScrollSpace = () => {
    const needed = (window.innerHeight * totalPanels * (window.innerWidth <= 768 ? 2.2 : 1.6));
    if (document.body.scrollHeight < needed + window.innerHeight) {
      spacer = document.createElement('div');
      spacer.style.width = '1px';
      spacer.style.height = `${needed}px`;
      spacer.style.pointerEvents = 'none';
      spacer.style.opacity = '0';
      document.body.appendChild(spacer);
    }
  };
  ensureScrollSpace();

  const scrollTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.sticky-cards',
      start: isMobile ? 'top top' : 'top top', // keep pinned from top of viewport
      end: computeEnd, // function so it recalculates on refresh/resizes
      pin: true,
      pinSpacing: false,
      scrub: 0.5,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      // no markers
    }
  });

  // build transitions
  for (let i = 0; i < totalPanels - 1; i++) {
    const currentPanel = panels[i] as HTMLElement;
    const nextPanel = panels[i + 1] as HTMLElement;
    const position = i;

    scrollTimeline
      .to(currentPanel, {
        scale: 0.5,
        rotation: 10,
        duration: 1,
        delay: 0.2,
        ease: 'none'
      }, position)
      .to(nextPanel, {
        y: '0%',
        duration: 1,
        delay: 0.2,
        ease: 'none'
      }, position);
  }

  // Ensure ScrollTrigger recalculates when needed (e.g., orientation change)
  const onResize = () => {
    ensureScrollSpace();
    ScrollTrigger.refresh();
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    scrollTimeline.kill();
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (spacer && spacer.parentElement) spacer.parentElement.removeChild(spacer);
  };
}, { scope: containerReff, dependencies: [animeList, loading] });



  useEffect(() => {
    if (!loading && animeList.length > 0) {
      // Give React a moment to paint before measuring
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [loading, animeList]);


  if (loading) return <div className="loading">Loading best anime...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div ref={containerReff}  className="best_anime_container" data-aos='fade-right' data-aos-duration="600">
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

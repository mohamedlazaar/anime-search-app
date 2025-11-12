import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import SwiperSlide from "../components/SwiperSlider";
import '../style/DetailsPage.css'

// ✅ Add Review interface
interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
  url: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
}
interface MediaData {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average: number;
  vote_count: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  overview: string;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ 
    id: number; 
    name: string; 
    logo_path: string;
  }>;
  production_countries: Array<{ 
    iso_3166_1: string; 
    name: string 
  }>;
  original_language: string;
  status: string;
}

interface DetailPageData extends MediaData {
  type: 'movie' | 'tv';
}

interface ImagesData {
  posters: Array<{
    file_path: string;
    vote_average: number;
    width: number;
    height: number;
  }>;
  backdrops: Array<{
    file_path: string;
    vote_average: number;
    width: number;
    height: number;
  }>;
  logos: Array<{
    file_path: string;
  }>;
}

interface DetailPageImgData extends ImagesData {
  type: 'movie' | 'tv';
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mediaType = searchParams.get('type') || 'movie';
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({maxWidth: 1024})
  const [data, setData] = useState<DetailPageData | null>(null);
  const [images, setImages] = useState<DetailPageImgData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]); // ✅ Reviews state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    adaptiveHeight: true,
    slidesToShow: isMobile ? 1 :2,
    sliderToScroll: 1,
    autoPlay:true,
    initialSlide: 0,
    centerPadding: '50px',
    className:'center',
    arrows: isTablet ? false : true,
    easing:'linear'

  }
  const settings_2 = {
    dots: true,
    infinite: true,
    speed: 500,
    adaptiveHeight: true,
    slidesToShow: isMobile ? 2 : 5,
    sliderToScroll: 1,
    autoPlay:true,
    initialSlide: 0,
    centerPadding: '50px',
    className:'center_2',
    arrows: isTablet ? false : true,
    easing: 'linear'
  }
  useEffect(() => {
    if (!id) return;
    
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const tryFetch = async () => {
      const options = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
          accept: 'application/json',
        },
        signal: controller.signal
      };

      try {
        let detectedType: 'movie' | 'tv' = mediaType as 'movie' | 'tv';
        let baseUrl: string;

        if (mediaType && (mediaType === 'movie' || mediaType === 'tv')) {
          baseUrl = `https://api.themoviedb.org/3/${mediaType}/${id}`;
        } else {
          baseUrl = `https://api.themoviedb.org/3/movie/${id}`;
          const testRes = await fetch(baseUrl, options);

          if (testRes.status === 404) {
            baseUrl = `https://api.themoviedb.org/3/tv/${id}`;
            detectedType = 'tv';
          }
        }

        // ✅ Add reviews to parallel fetch
        const [dataRes, imagesRes, reviewsRes] = await Promise.all([
          fetch(baseUrl, options),
          fetch(`${baseUrl}/images`, options),
          fetch(`${baseUrl}/reviews`, options) // ✅ Fetch reviews
        ]);

        if (!dataRes.ok) throw new Error(`Data API ${dataRes.status}`);
        if (!imagesRes.ok) throw new Error(`Images API ${imagesRes.status}`);
        // Reviews might not exist, so check separately
        if (!reviewsRes.ok && reviewsRes.status !== 404) {
          console.warn(`Reviews API ${reviewsRes.status}`);
        }

        const jsonData = await dataRes.json();
        const jsonImages = await imagesRes.json();
        const jsonReviews = reviewsRes.ok ? await reviewsRes.json() : { results: [] }; // ✅ Handle reviews
        console.log('jsondata', jsonData)

        setData({ type: detectedType, ...jsonData });
        setImages({ type: detectedType, ...jsonImages });
        setReviews(jsonReviews.results || []); // ✅ Set reviews
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Error loading details");
      } finally {
        setLoading(false);
      }
    };

    tryFetch();

    return () => controller.abort();
  }, [id, mediaType]);

  if (!id) return <div style={{ color: 'white' }}>Missing ID</div>;

  const getTitle = () => data?.title || data?.name || "N/A";
  const getOriginalTitle = () => data?.original_title || data?.original_name || "";
  const getAirDate = () => {
    if (data?.type === 'movie') {
      return data?.release_date;
    }
    return data?.first_air_date;
  };
  const getDuration = () => {
    if (data?.type === 'movie') {
      return data?.runtime;
    }
    return data?.episode_run_time?.[0];
  };

  return (
    <div className="container" style={{ color: 'white', padding: '20px' }}>
      <Link to="/" className="back"> ← Back </Link>

      {loading && <p>Loading detail…</p>}
      {error && <p className="error">Error: {error}</p>}

      {data && (
        <div className="data_container">
          {/* Backdrop Image */}
          {data.backdrop_path && (
            <div
              style={{
                   backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://image.tmdb.org/t/p/original${data.backdrop_path})`,
              }}
              className="fixed_image"
            >
              <h1>{data.name || data.title}</h1>
            </div>
          )}

          {/* Media Type Badge */}
          <div style={{ 
            backgroundColor: data.type === 'tv' ? '#FF6B35' : '#3B62C6'
          }} className="badge">
            {data.type === 'tv' ? '📺 TV SHOW' : '🎬 MOVIE'}
          </div>

          <div className="info_container">
            {/* Poster Image */}
            <div>
              <img
                src={`https://image.tmdb.org/t/p/w500${data.poster_path}`} loading="lazy"
                alt={getTitle()}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x450?text=No+Image';
                }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1 }} className="details">
              <h1> {getTitle()}</h1>
              
              {getOriginalTitle() && (
                <p> {getOriginalTitle()} </p>
              )}
              <div className="info" style={{ gridTemplateColumns: `${isMobile ? '1fr' : '1fr 1fr'}`}}>
                 <p>
                    <strong style={{ color: 'rgb(59, 98, 198)' }}>
                      {data.type === 'tv' ? 'First Air Date:' : 'Release Date:'}
                    </strong>{" "}
                    {getAirDate() ? new Date(getAirDate()!).toLocaleDateString() : "N/A"}
                  </p>
                  <p>
                    <strong >
                      {data.type === 'tv' ? 'Episode Runtime:' : 'Runtime:'}
                    </strong>{" "}
                    {getDuration() ? `${getDuration()} minutes` : "N/A"}
                  </p>
                {data.type === 'tv' && data.number_of_seasons && (
                  <p>
                    <strong >Seasons:</strong>{" "}
                    {data.number_of_seasons}
                  </p>
                )}
                {data.type === 'tv' && data.number_of_episodes && (
                  <p>
                    <strong >Episodes:</strong>{" "}
                    {data.number_of_episodes}
                  </p>
                )}
                <p>
                  <strong >Rating:</strong>{" "}
                  {data.vote_average > 0 ? `${data.vote_average.toFixed(1)}/10` : "N/A"}
                </p>
                <p>
                  <strong >Votes:</strong>{" "}
                  {data.vote_count ? data.vote_count.toLocaleString() : "N/A"}
                </p>
                <p>
                  <strong >Status:</strong>{" "}
                  {data.status || "N/A"}
                </p>
                <p>
                  <strong >Language:</strong>{" "}
                  {data.original_language?.toUpperCase() || "N/A"}
                </p>
                <p>
                  <strong >Country:</strong>{" "}
                  {data.production_countries?.map((c: any) => c.name).join(", ") || "N/A"}
                </p>
              </div>

              {/* Genres */}
              <div className="genres">
                <strong >Genres:</strong>
                <div>
                  {data.genres?.map((genre: any) => (
                    <span key={genre.id}>{genre.name}</span>
                  ))}
                </div>
              </div>

              {/* Production Companies */}
              {data.production_companies && data.production_companies.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <strong style={{ fontSize: '1.3rem' }}>Production Companies:</strong>
                  <p style={{ color: 'white', fontSize: '1.1rem' }}>
                    {data.production_companies.map((c: any) => c.name).join(", ")}
                  </p>
                </div>
              )}

              {/* Overview */}
              {data.overview && (
                <div style={{ marginTop: "30px" }}>
                  <h3 style={{ fontSize: "1.8rem", color: "rgb(59, 98, 198)" }}>Overview</h3>
                  <p style={{ 
                    lineHeight: "1.8", 
                    fontSize: "1.1rem",
                    color: '#ccc'
                  }}>
                    {data.overview}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Backdrop Image */}
          {data.backdrop_path && (
            <div
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://image.tmdb.org/t/p/original${data.backdrop_path})`,
              }}
              className='fixed_image'
            />
          )}

          {/* ✅ Display Posters Gallery */}
         
          {images && images.posters && images.posters.length > 0 && (
            <div style={{ margin: '40px auto', width:'90%', }}>
              <h3 style={{ fontSize: "1.8rem", color: "rgb(59, 98, 198)", marginBottom: '20px' }}>
                Poster Gallery
              </h3>
              <div style={{
                gap: '15px',
                marginBottom: '40px'
              }}>
            <SwiperSlide settings={settings_2}>     
                {images.posters.slice(0, 10).map((poster, idx) => (
                  <img
                    className="images_slide posters_"
                    key={idx}
                    src={`https://image.tmdb.org/t/p/w300${poster.file_path}`}
                    alt={`Poster ${idx}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x300?text=No+Image';
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
                  </SwiperSlide>
              </div>
            </div>
          )}
       
          {/* ✅ Display Backdrops Gallery */}
          {images && images.backdrops && images.backdrops.length > 0 && (
            <div style={{ margin: '40px auto', width:'90%', }}>
              <h3 style={{ fontSize: "2.1rem", color: "rgb(59, 98, 198)", marginBottom: '20px' }}>
                Backdrop Gallery
              </h3>
              <div style={{
                width:'100%',
                height: isTablet ? 'auto' : '400px' }}>

                 <SwiperSlide settings={settings}>
                  {images.backdrops.slice(0, 8).map((backdrop, idx) => (
                                  <img
                                    key={idx}
                                    src={`https://image.tmdb.org/t/p/w500${backdrop.file_path}`}
                                    alt={`Backdrop ${idx}`}
                                    width='100'
      
                                   className="images_slide backdrops_"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.01)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  />
                                ))} 
                 </SwiperSlide>
             
              </div>
            </div>
          )}

          {/* ✅ REVIEWS SECTION */}
          {reviews && reviews.length > 0 && (
            <div className="reviews_container">
              <h3>Reviews ({reviews.length})</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `${isMobile ? '1fr' : '1fr 1fr'}`,
                gap: '20px'
              }}>
                {reviews.slice(0, 6).map((review) => (
                  <div key={review.id} className='review' >
                    {/* Review Author */}
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>
                        {review.author_details?.name || review.author}
                      </h4>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem', color: 'rgb(59, 98, 198)' }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>

                      {/* Rating */}
                      {review.author_details?.rating && (
                        <div style={{ marginTop: '8px' }}>
                          <strong style={{ color: '#ffd700' }}>
                            Rating: {review.author_details.rating}/10 ⭐
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="review_count" >{review.content}</p>
                    {/* Read More Link */}
                    <a href={review.url} target="_blank" rel="noopener noreferrer" className="review_url"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffd700';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgb(59, 98, 198)';
                      }}
                    >
                      Read Full Review →
                    </a>
                  </div>
                ))}
              </div>
              {/* Show more reviews button */}
              {reviews.length > 6 && (
                <p className="more_reviews">
                  ... and {reviews.length - 6} more reviews
                </p>
              )}
            </div>
          )}

          {/* No reviews message */}
          {reviews.length === 0 && (
            <div>

            </div>
          )}
        </div>
      )}
  
    </div>
  );
}

import { Link } from "react-router-dom";

export default function AnimeCard({ anime, type }: { anime: any, type?: any }) {
  return (
    <Link className="card" to={`/anime/${anime.id}?type=${type}`}>
      <img src={`https://image.tmdb.org/t/p/original${anime.backdrop_path || anime.poster_path}`} alt={anime.title} />
      <div className="card-body">
          <p style={{color: 'whtie', fontWeight:'bold'}}>{anime.release_date}</p>
        <h3>{anime.title || anime.original_title || anime.name}</h3>
        <p>{anime.overview ? (anime.overview.slice(0, 140) + (anime.overview.length > 140 ? "…" : "")) : "No synopsis"}</p>
      
      </div>
    </Link>
  );
}

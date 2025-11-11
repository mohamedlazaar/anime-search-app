import { Link } from "react-router-dom";

export default function AnimeCard({ anime }: { anime: any }) {
  return (
    <Link className="card" to={`/anime/${anime.id}?type=${anime.type}`}>
      <img src={anime.poster_path || anime.backdrop_path} alt={anime.title} />
      <div className="card-body">
          <p style={{color: 'whtie', fontWeight:'bold'}}>{anime.release_date}</p>
        <h3>{anime.title}</h3>
        <p>{anime.overview ? (anime.overview.slice(0, 140) + (anime.overview.length > 140 ? "…" : "")) : "No synopsis"}</p>
      
      </div>
    </Link>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function AnimeCard({ anime }: { anime: any }) {
  return (
    <Link className="card" to={`/anime/${anime.mal_id}`}>
      <img src={anime.images?.jpg?.image_url} alt={anime.title} />
      <div className="card-body">
        <h3>{anime.title}</h3>
        <p>{anime.synopsis ? (anime.synopsis.slice(0, 140) + (anime.synopsis.length > 140 ? "…" : "")) : "No synopsis"}</p>
      </div>
    </Link>
  );
}

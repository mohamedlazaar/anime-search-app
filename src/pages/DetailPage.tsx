import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { buildAnimeDetailUrl } from "../api/jikan";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(buildAnimeDetailUrl(id), { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((json) => {
        setData(json.data);
        console.log('ss', json.data)
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "Error");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  if (!id) return <div>Missing ID</div>;

  return (
    <div className="container">
      <Link to="/" style={{ alignSelf: 'start', textDecoration:'none', color: "white", backgroundColor:'rgb(59, 98, 198)', fontSize:'1.2rem', padding:'10px', borderRadius:'25px'}}>← Back</Link>
      {loading && <p>Loading detail…</p>}
      {error && <p className="error">Error: {error}</p>}
      {data && (


        <div className="data_container">
          <h2 style={{ fontSize: '3rem'}}>{data.title}</h2>  
         <img src={data.images?.jpg?.large_image_url} alt={data.title} style={{ width: '300px', height:'400px'}}  />
         <div  className="info" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'50px'}}>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Year:</strong> {data.year ?? "N/A"}</p>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Favorites:</strong> {data.favorites ?? "N/A"}</p>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Score:</strong> {data.score ?? "N/A"}</p>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Scored By:</strong> {data.scored_by ?? "N/A"}</p>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Episodes:</strong> {data.episodes ?? "N/A"}</p>
            <p><strong style={{color: 'white', marginRight:'5px'}}>Rank:</strong> {data.rank ?? "N/A"}</p>
            <p ><strong style={{color: 'white', marginRight:'5px'}}>Genres:</strong>
            {data.genres.map((genre:any)=>(
                <span key={genre.mal_id}> {genre.name ?? "N/A"} </span> 
            ))}
            </p>
            <p ><strong style={{color: 'white', marginRight:'5px'}}>Duration:</strong> {data.duration}/episode</p>
            <p ><strong style={{color: 'white', marginRight:'5px'}}>Studios: </strong> 
            {data.studios.map((studio:any)=>(
                <a href={studio.url} key={studio.mal_id}>
            {studio.name}
                </a>
            ))} 
            </p>
            <p ><strong style={{color: 'white', marginRight:'5px'}}>Status:</strong> {data.status}</p>
         </div>
         <div style={{display:'flex', flexDirection:'column', marginTop:'20px'}}>
            <h3 style={{fontSize:'1.4rem'}}>Description</h3>
            <p style={{lineHeight:'1.5', letterSpacing:'2px'}}>{data.synopsis}</p>
         </div>
        </div>
        
      )}
    </div>
  );
}

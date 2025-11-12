import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/index";
import { useMediaQuery } from "react-responsive";
import {
  setQuery,
  startLoading,
  setResults,
  setError,
  setPage,
  clearResults
} from "../store/searchSlice";
import AnimeCard from "../components/AnimeCard";
import Pagination from "../components/Pagination";
import '../style/Search.css'

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_MS = 250;

const Search: React.FC<SearchProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { query, results, page, loading, error, hasMore } = useSelector(
    (s: RootState) => s.search
  );
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLocalQuery(value);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      dispatch(setQuery(value));
      dispatch(setPage(1));
      performSearch(value, 1);
    }, DEBOUNCE_MS);
  }

  async function performSearch(q: string, pageToFetch: number) {
    if (!q.trim()) {
      if (abortRef.current) abortRef.current.abort();
      dispatch(clearResults());
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(startLoading());

    const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
      q
    )}&include_adult=false&language=en-US&page=${pageToFetch}&with_origin_country=JP&with_genres=16`;
    const movieUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      q
    )}&include_adult=false&language=en-US&page=${pageToFetch}&with_origin_country=JP&with_genres=16`;

    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
      },
      signal: controller.signal,
    };

    try {
      const [tvRes, movieRes] = await Promise.all([
        fetch(tvUrl, options),
        fetch(movieUrl, options),
      ]);

      if (!tvRes.ok || !movieRes.ok) {
        throw new Error(`API error ${tvRes.status || movieRes.status}`);
      }

      const tvData = await tvRes.json();
      const movieData = await movieRes.json();

      const combinedResults = [
        ...tvData.results.map((item: any) => ({ ...item, type: "tv" })),
        ...movieData.results.map((item: any) => ({ ...item, type: "movie" })),
      ];

      const filteredResults = combinedResults.filter((item: any) => {
        return (
          item.backdrop_path &&
          item.poster_path &&
          (item.name ||
            item.title ||
            item.original_name ||
            item.original_title) &&
          item.overview &&
          item.genre_ids?.includes(16)
        );
      });

      const mapped = filteredResults.map((item: any) => ({
        id: item.id,
        mal_id: item.id,
        type: item.type || (item.name ? "tv" : "movie"),
        title:
          item.name ||
          item.title ||
          item.original_name ||
          item.original_title,
        original_title: item.original_name || item.original_title,
        path_poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        backdrop_path: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
        overview: item.overview,
      }));

      const totalPages = Math.max(tvData.total_pages || 1, movieData.total_pages || 1);
      const hasMoreRes = pageToFetch < totalPages;

      dispatch(
        setResults({
          results: mapped,
          hasMore: hasMoreRes,
          page: pageToFetch,
        })
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      console.error(err);
      dispatch(setError(err.message || "Unknown error"));
    }
  }

  function goToPage(newPage: number) {
    dispatch(setPage(newPage));
    performSearch(query, newPage);
  }

  // Only render if isOpen is true
  if (!isOpen) return null;

  return (
    <div className="search-section" style={{padding: `${isMobile ? "50px 0" : "0"}` }}>
      <button className="close" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50px" viewBox="0 0 24 24" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM8.96965 8.96967C9.26254 8.67678 9.73742 8.67678 10.0303 8.96967L12 10.9394L13.9696 8.96969C14.2625 8.6768 14.7374 8.6768 15.0303 8.96969C15.3232 9.26258 15.3232 9.73746 15.0303 10.0303L13.0606 12L15.0303 13.9697C15.3232 14.2625 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2625 15.3232 13.9696 15.0303L12 13.0607L10.0303 15.0303C9.73744 15.3232 9.26256 15.3232 8.96967 15.0303C8.67678 14.7374 8.67678 14.2626 8.96967 13.9697L10.9393 12L8.96965 10.0303C8.67676 9.73744 8.67676 9.26256 8.96965 8.96967Z" />
          </svg>
      </button>

      <h1 className="title">Anime Search</h1>
      <input value={localQuery} onChange={handleInputChange} placeholder="Search anime..."  aria-label="Search anime" className="search-input" />

      {loading && <p style={{ color: "#fff" }}>Loading…</p>}
      {error && (
        <p className="error" style={{ color: "#ff4444" }}>
          Error: {error}
        </p>
      )}
      {!loading &&
        results.length === 0 &&
        query.trim() !== "" && (
          <p style={{ color: "#888" }}>No anime found for "{query}"</p>
        )}

      <div
        style={{height: "90%", overflowY: `${results.length === 0 ? "hidden" : "scroll"}`}} className="scroll-container" >
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: `${
              isMobile ? "1fr " : "repeat(auto-fill, minmax(250px, 1fr))"
            }`,
            gap: "20px",
            width: "100%",
            maxWidth: "1400px",
            padding: `${isMobile ? "20px 0 " : "20px"}`,
            marginTop: `${isMobile ? "30px" : "0px"}`,
          }}
        >
          {results.map((a) => (
            <AnimeCard key={a.mal_id} anime={a} />
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <Pagination
          page={page}
          onPageChange={goToPage}
          hasMore={hasMore}
        />
      )}
    </div>
  );
};

export default Search;

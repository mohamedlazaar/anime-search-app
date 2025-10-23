import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/index";
import {
  setQuery,
  startLoading,
  setResults,
  setError,
  setPage,
  clearResults
} from "../store/searchSlice";
import { buildSearchUrl } from "../api/jikan";
import AnimeCard from "../components/AnimeCard";
import Pagination from "../components/Pagination";

const DEBOUNCE_MS = 250;
const RESULTS_PER_PAGE = 25; // Jikan default per page

export default function SearchPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { query, results, page, loading, error, hasMore } = useSelector((s: RootState) => s.search);
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // when route mounts, ensure localQuery synchronized
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    // Cleanup if component unmounts: abort any in-flight fetch
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLocalQuery(value);

    // Debounce the API calls
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // update redux query and fetch page 1
      dispatch(setQuery(value));
      dispatch(setPage(1));
      performSearch(value, 1);
    }, DEBOUNCE_MS);
  }

  async function performSearch(q: string, pageToFetch: number) {
    // if empty query => clear
    if (!q.trim()) {
      if (abortRef.current) abortRef.current.abort();
      dispatch(clearResults());
      return;
    }

    // abort previous
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(startLoading());
    const url = buildSearchUrl(q, pageToFetch);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }
      const data = await res.json();
      // data.pagination.items.total? But we have last_visible_page in Jikan v4 response
      const lastPage = data.pagination?.last_visible_page ?? pageToFetch;
      const hasMoreRes = pageToFetch < lastPage;
      const mapped = data.data.map((item: any) => ({
        mal_id: item.mal_id,
        title: item.title,
        images: item.images,
        synopsis: item.synopsis
      }));
      dispatch(setResults({ results: mapped, hasMore: hasMoreRes, page: pageToFetch }));
    } catch (err: any) {
      if (err.name === "AbortError") {
        // cancelled — ignore
        return;
      }
      console.error(err);
      dispatch(setError(err.message || "Unknown error"));
    }
  }

  // called when user navigates pages
  function goToPage(newPage: number) {
    dispatch(setPage(newPage));
    performSearch(query, newPage);
  }

  // optional: initial search if query prefilled
  useEffect(() => {
    if (query && results.length === 0) {
      performSearch(query, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <h1>Anime Search</h1>
      <input
        value={localQuery}
        onChange={handleInputChange}
        placeholder="Search anime..."
        aria-label="Search anime"
        className="search-input"
      />
      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}</p>}
      {!loading && results.length === 0 && query.trim() !== "" && <p>No results.</p>}

      <div className="grid">
        {results.map((a) => (
          <AnimeCard key={a.mal_id} anime={a} />
        ))}
      </div>

      <Pagination page={page} onPageChange={goToPage} hasMore={hasMore} />
    </div>
  );
}

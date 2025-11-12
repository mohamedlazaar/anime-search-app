import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AnimeShort {
  mal_id: number;
  title: string;
  images?: { jpg?: { image_url?: string } };
  synopsis?: string;
  type?:string
}

interface SearchState {
  query: string;
  page: number;
  results: AnimeShort[];
  lastFetchedAt?: string;
  loading: boolean;
  error?: string | null;
  hasMore: boolean;
}

const initialState: SearchState = {
  query: "",
  page: 1,
  results: [],
  loading: false,
  error: null,
  hasMore: false
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    startLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setResults(state, action: PayloadAction<{ results: AnimeShort[]; hasMore: boolean; page: number }>) {
      state.results = action.payload.results;
      state.hasMore = action.payload.hasMore;
      state.page = action.payload.page;
      state.loading = false;
      state.lastFetchedAt = new Date().toISOString();
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearResults(state) {
      state.results = [];
      state.hasMore = false;
      state.page = 1;
    }
  }
});

export const { setQuery, setPage, startLoading, setResults, setError, clearResults } = searchSlice.actions;
export default searchSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Filter State Shape ───────────────────────────────────────────────────────
export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | null;
  squareFeet: [number, number] | null;
  coordinates: { lat: number; lng: number };
}

// ─── Global Slice State ───────────────────────────────────────────────────────
export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isFiltersFullOpen: boolean;
  viewMode: "grid" | "list";
  filters: FiltersState;
}

const initialFilters: FiltersState = {
  location: "Los Angeles",
  beds: "any",
  baths: "any",
  propertyType: "any",
  amenities: [],
  availableFrom: "",
  priceRange: null,
  squareFeet: null,
  // Los Angeles coordinates
  coordinates: { lat: 34.0549, lng: -118.2426 },
};

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isFiltersFullOpen: false,
  viewMode: "grid",
  filters: initialFilters,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
  },
});

export const {
  setIsSidebarCollapsed,
  setFilters,
  toggleFiltersFullOpen,
  setViewMode,
} = globalSlice.actions;

export default globalSlice.reducer;

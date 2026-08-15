import { Property } from "@/types";
import { FiltersState } from "../index";
import { api } from "../baseApi";

// ── Property Slice ────────────────────────────────────────────────────────────
const propertyApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Fetch a list of properties with optional filters. */
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: string; managerCognitoId?: string }
    >({
      query: (filters) => {
        const params: Record<string, string | number | undefined> = {};

        if (filters.location) params.location = filters.location;
        if (filters.beds && filters.beds !== "any") params.beds = filters.beds;
        if (filters.baths && filters.baths !== "any")
          params.baths = filters.baths;
        if (filters.propertyType && filters.propertyType !== "any")
          params.propertyType = filters.propertyType;
        if (filters.amenities && filters.amenities.length > 0)
          params.amenities = filters.amenities.join(",");
        if (filters.availableFrom)
          params.availableFrom = filters.availableFrom;
        if (filters.priceRange) {
          params.priceMin = filters.priceRange[0];
          params.priceMax = filters.priceRange[1];
        }
        if (filters.squareFeet) {
          params.squareFeetMin = filters.squareFeet[0];
          params.squareFeetMax = filters.squareFeet[1];
        }
        if (filters.coordinates) {
          params.latitude = filters.coordinates.lat;
          params.longitude = filters.coordinates.lng;
        }
        if (filters.favoriteIds) params.favoriteIds = filters.favoriteIds;
        if (filters.managerCognitoId)
          params.managerCognitoId = filters.managerCognitoId;

        return { url: "/properties", params };
      },
      providesTags: ["Properties"],
    }),

    /** Fetch a single property by ID. */
    getProperty: build.query<Property, number>({
      query: (id) => ({ url: `/properties/${id}` }),
      providesTags: ["Properties"],
    }),

    /** Create a new property (multipart/form-data — includes photos). */
    createProperty: build.mutation<Property, FormData>({
      query: (formData) => ({
        url: "/properties",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Properties"],
    }),

    /** Update an existing property's mutable fields. */
    updateProperty: build.mutation<
      Property,
      { id: number; body: Partial<Omit<Property, "id" | "location" | "photoUrls">> }
    >({
      query: ({ id, body }) => ({
        url: `/properties/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Properties"],
    }),

    /** Permanently delete a property and its S3 photos. */
    deleteProperty: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyApi;

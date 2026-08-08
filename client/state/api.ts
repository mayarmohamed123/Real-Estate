import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, Manager, Tenant, Property, Application, Lease, Payment } from "@/types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { createNewUserInDatabase } from "@/lib/utils";
import { FiltersState } from "./index";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    prepareHeaders: async (headers) => {
      try {
        const session = await fetchAuthSession();
        const { idToken } = session.tokens ?? {};
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
      } catch {
        // unauthenticated — skip auth header
      }
      return headers;
    },
  }),
  tagTypes: ["Tenant", "Manager", "Properties", "Leases"],
  endpoints: (build) => ({
    // ── Auth ──────────────────────────────────────────────────────────────────
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};

          if (!idToken) {
            return { error: "No active session" };
          }

          const user = await getCurrentUser();
          const userRole = (idToken.payload["custom:role"] as string) ?? null;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          // JIT pattern ( if the user doesn't exist, create one )
          if (
            userDetailsResponse.error &&
            "status" in userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ,
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          return {
            error: error.message || "couldn't fetch the user data",
          };
        }
      },
      providesTags: ["Tenant", "Manager"],
    }),

    // ── Properties ────────────────────────────────────────────────────────────
    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: string }
    >({
      query: (filters) => {
        const params: Record<string, string | number | undefined> = {};

        if (filters.location) params.location = filters.location;
        if (filters.beds && filters.beds !== "any") params.beds = filters.beds;
        if (filters.baths && filters.baths !== "any") params.baths = filters.baths;
        if (filters.propertyType && filters.propertyType !== "any")
          params.propertyType = filters.propertyType;
        if (filters.amenities && filters.amenities.length > 0)
          params.amenities = filters.amenities.join(",");
        if (filters.availableFrom) params.availableFrom = filters.availableFrom;
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
        if (filters.favoriteIds) {
          params.favoriteIds = filters.favoriteIds;
        }

        return { url: "/properties", params };
      },
      providesTags: ["Properties"],
    }),

    getProperty: build.query<Property, number>({
      query: (id) => ({ url: `/properties/${id}` }),
      providesTags: ["Properties"],
    }),

    // ── Tenants ───────────────────────────────────────────────────────────────
    updateTenantSetting: build.mutation<Tenant, Partial<Tenant>>({
      query: ({ cognitoId, ...body }) => ({
        url: `/tenants/${cognitoId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "Tenant", id: "LIST" },
        { type: "Manager", id: "LIST" },
      ],
    }),

    // ── Managers ──────────────────────────────────────────────────────────────
    updateManagerSetting: build.mutation<Manager, Partial<Manager>>({
      query: ({ cognitoId, ...body }) => ({
        url: `/managers/${cognitoId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "Tenant", id: "LIST" },
        { type: "Manager", id: "LIST" },
      ],
    }),
    // ── Favorites ─────────────────────────────────────────────────────────────
    addFavorite: build.mutation<Tenant, { cognitoId: string; propertyId: number }>(
      {
        query: ({ cognitoId, propertyId }) => ({
          url: `/tenants/${cognitoId}/favorites`,
          method: "POST",
          body: { propertyId },
        }),
        invalidatesTags: ["Tenant", "Properties"],
      }
    ),

    removeFavorite: build.mutation<Tenant, { cognitoId: string; propertyId: number }>(
      {
        query: ({ cognitoId, propertyId }) => ({
          url: `/tenants/${cognitoId}/favorites`,
          method: "DELETE",
          body: { propertyId },
        }),
        invalidatesTags: ["Tenant", "Properties"],
      }
    ),

    // ── Applications ──────────────────────────────────────────────────────────
    createApplication: build.mutation<
      Application,
      {
        propertyId: number;
        tenantCognitoId: string;
        name: string;
        email: string;
        phoneNumber: string;
        message?: string;
      }
    >({
      query: (body) => ({
        url: "/applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tenant", "Properties"],
    }),

    // ── Leases ────────────────────────────────────────────────────────────────
    getLeases: build.query<Lease[], { tenantCognitoId?: string }>({
      query: ({ tenantCognitoId }) => ({
        url: "/leases",
        params: tenantCognitoId ? { tenantCognitoId } : undefined,
      }),
      providesTags: ["Leases"],
    }),

    getLeasePayments: build.query<Payment[], number>({
      query: (leaseId) => ({ url: `/leases/${leaseId}/payments` }),
      providesTags: ["Leases"],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useUpdateTenantSettingMutation,
  useUpdateManagerSettingMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useCreateApplicationMutation,
  useGetLeasesQuery,
  useGetLeasePaymentsQuery,
} = api;

import { Tenant } from "@/types";
import { api } from "../baseApi";

// ── Tenant Slice ──────────────────────────────────────────────────────────────
const tenantApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Update a tenant's profile settings. */
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

    /** Add a property to the tenant's saved favorites. */
    addFavorite: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites`,
        method: "POST",
        body: { propertyId },
      }),
      invalidatesTags: ["Tenant", "Properties"],
    }),

    /** Remove a property from the tenant's saved favorites. */
    removeFavorite: build.mutation<
      Tenant,
      { cognitoId: string; propertyId: number }
    >({
      query: ({ cognitoId, propertyId }) => ({
        url: `/tenants/${cognitoId}/favorites`,
        method: "DELETE",
        body: { propertyId },
      }),
      invalidatesTags: ["Tenant", "Properties"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateTenantSettingMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = tenantApi;

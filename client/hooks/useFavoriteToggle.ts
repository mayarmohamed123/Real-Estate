"use client";

import { useCallback } from "react";
import {
  useGetAuthUserQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "@/state/api";
import { Tenant } from "@/types";
import { toast } from "sonner";

/**
 * Encapsulates the favorite-toggle logic for a single property with Toast notifications.
 *
 * Usage:
 *   const { isFavorited, toggleFavorite, isLoading } = useFavoriteToggle(property.id);
 */
export function useFavoriteToggle(propertyId: number) {
  const { data: authUser } = useGetAuthUserQuery();
  const [addFavorite, { isLoading: isAdding }] = useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveFavoriteMutation();

  const cognitoId = authUser?.cognitoInfo?.userId;
  const isTenant = authUser?.userRole === "tenant";

  // Cast userInfo to Tenant only when the role confirms it
  const tenant = isTenant ? (authUser?.userInfo as Tenant) : null;

  // Check if this property is already in the tenant's favorites list
  const isFavorited =
    tenant?.favorites?.some((fav) => fav.id === propertyId) ?? false;

  /**
   * Toggle favorite status.
   * Calls preventDefault/stopPropagation so it is safe inside a Link.
   */
  const toggleFavorite = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      if (!cognitoId || !isTenant) {
        toast.error("Please sign in as a tenant to save favorites");
        return;
      }

      try {
        if (isFavorited) {
          await removeFavorite({ cognitoId, propertyId }).unwrap();
          toast.success("Property removed from favorites");
        } else {
          await addFavorite({ cognitoId, propertyId }).unwrap();
          toast.success("Property added to favorites");
        }
      } catch (error: unknown) {
        const err = error as { data?: { message?: string }; message?: string };
        const errorMsg =
          err?.data?.message ||
          err?.message ||
          "Failed to update favorites";
        toast.error(errorMsg);
      }
    },
    [cognitoId, isTenant, isFavorited, propertyId, addFavorite, removeFavorite]
  );

  return {
    /** True when this property is in the user's favorites */
    isFavorited,
    /** Call this on the heart button click */
    toggleFavorite,
    /** True while the mutation request is in flight */
    isLoading: isAdding || isRemoving,
    /** False when the user is not logged in or is a manager */
    isAuthenticated: !!cognitoId && isTenant,
  };
}

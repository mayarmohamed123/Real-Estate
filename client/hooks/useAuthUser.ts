"use client";

import { useGetAuthUserQuery } from "@/state/api";
import type { Manager, Tenant } from "@/types";

/**
 * Centralised hook for auth user data.
 * Replaces the duplicated pattern of calling useGetAuthUserQuery and
 * manually extracting cognitoId in every dashboard page.
 */
export function useAuthUser() {
  const { data: authUser, isLoading } = useGetAuthUserQuery();

  const cognitoId = authUser?.cognitoInfo?.userId ?? null;
  const userRole = authUser?.userRole ?? null;
  const userInfo = authUser?.userInfo ?? null;

  return {
    authUser,
    isLoading,
    cognitoId,
    userRole,
    /** Typed as Manager when the role is "manager". */
    manager: userRole === "manager" ? (userInfo as Manager) : null,
    /** Typed as Tenant when the role is "tenant". */
    tenant: userRole === "tenant" ? (userInfo as Tenant) : null,
  };
}

/**
 * @file state/api.ts
 *
 * Thin barrel — keeps all existing import paths working (`@/state/api`).
 *
 * Architecture:
 *   state/baseApi.ts          ← createApi (no endpoints, no circular deps)
 *   state/apiSlices/          ← one file per domain; each calls injectEndpoints
 *   state/api.ts  (this file) ← imports slices (registers them) + re-exports
 *
 * The side-effect imports below execute injectEndpoints for each domain,
 * so by the time redux.tsx reads `api.reducer` / `api.middleware`, all
 * endpoints are already registered on the api object.
 */

// ── Base api (for redux.tsx store wiring) ─────────────────────────────────────
export { api } from "./baseApi";

// ── Domain slices — importing them is the side effect that injects endpoints ──
import "./apiSlices/authApiSlice";
import "./apiSlices/propertyApiSlice";
import "./apiSlices/tenantApiSlice";
import "./apiSlices/managerApiSlice";
import "./apiSlices/applicationApiSlice";
import "./apiSlices/leaseApiSlice";

// ── Re-export all hooks so existing `import { ... } from "@/state/api"` paths ─
// ── continue to work without any changes to consuming components.            ──

// Auth
export { useGetAuthUserQuery } from "./apiSlices/authApiSlice";

// Properties
export {
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from "./apiSlices/propertyApiSlice";

// Tenants
export {
  useUpdateTenantSettingMutation,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "./apiSlices/tenantApiSlice";

// Managers
export { useUpdateManagerSettingMutation } from "./apiSlices/managerApiSlice";

// Applications
export {
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationStatusMutation,
} from "./apiSlices/applicationApiSlice";

// Leases
export {
  useGetLeasesQuery,
  useGetLeasePaymentsQuery,
} from "./apiSlices/leaseApiSlice";

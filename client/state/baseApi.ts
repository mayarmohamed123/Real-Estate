import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * The single RTK Query api instance.
 * Endpoints are injected by each domain slice in ./apiSlices/*.
 * This file is intentionally kept thin — only base config lives here
 * so that the slice files can import it without circular dependencies.
 */
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
  tagTypes: ["Tenant", "Manager", "Properties", "Leases", "Applications"],
  // All endpoints are injected by the domain slices — see ./apiSlices/*.
  endpoints: () => ({}),
});

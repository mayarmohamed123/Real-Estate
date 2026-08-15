import { User, Manager, Tenant } from "@/types";
import { createNewUserInDatabase } from "@/lib/utils";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { api } from "../baseApi";

// ── Auth Slice ────────────────────────────────────────────────────────────────
const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Fetches the currently authenticated user from Cognito + our backend.
     * Uses a JIT (Just-In-Time) provisioning pattern: if the user does not yet
     * exist in the database (404), we create them on the fly.
     */
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};

          if (!idToken) {
            return { error: "No active session" };
          }

          const user = await getCurrentUser();
          const userRole =
            (idToken.payload["custom:role"] as string) ?? null;

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          // JIT provisioning: create the user record on first login
          if (
            userDetailsResponse.error &&
            "status" in userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
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
            error: error.message || "Couldn't fetch user data",
          };
        }
      },
      providesTags: ["Tenant", "Manager"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuthUserQuery } = authApi;

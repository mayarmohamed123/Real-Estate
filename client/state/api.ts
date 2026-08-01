import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, Manager, Tenant } from "@/types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { createNewUserInDatabase } from "@/lib/utils";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Tenant", "Manager"],
  endpoints: (build) => ({
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
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingMutation,
  useUpdateManagerSettingMutation,
} = api;

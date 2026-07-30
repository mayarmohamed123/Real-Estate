import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, Manager, Tenant } from "@/types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

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
  tagTypes: [],
  endpoints: (build) => ({
    getAuthUser: build.query<User, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          console.log(session);
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          console.log(user);
          const userRole = (idToken?.payload["custom:role"] as string) ?? null;
          console.log(userRole);

          const endpoint =
            userRole === "manager"
              ? `/manager/${user.userId}`
              : `/tenants/${user.userId}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          // JIT pattern ( if the user doesn't exist, create one )
          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return {
            error: error.message || "couldn't fetch the user data",
          };
        }
      },
    }),
  }),
});

export const { useGetAuthUserQuery } = api;

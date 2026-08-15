import { Manager } from "@/types";
import { api } from "../baseApi";

// ── Manager Slice ─────────────────────────────────────────────────────────────
const managerApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Update a manager's profile settings. */
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
  overrideExisting: false,
});

export const { useUpdateManagerSettingMutation } = managerApi;

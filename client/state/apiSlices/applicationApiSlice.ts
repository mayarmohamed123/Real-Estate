import { Application } from "@/types";
import { api } from "../baseApi";

// ── Application Slice ─────────────────────────────────────────────────────────
const applicationApi = api.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Fetch applications for a given user.
     * userType determines whether to filter by tenantCognitoId or managerCognitoId.
     */
    getApplications: build.query<
      Application[],
      { userId: string; userType: "tenant" | "manager" }
    >({
      query: ({ userId, userType }) => ({
        url: "/applications",
        params: { userId, userType },
      }),
      providesTags: ["Applications"],
    }),

    /** Submit a new rental application for a property. */
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

    /**
     * Update the status of an application (manager only).
     * Approving automatically creates a Lease record on the backend.
     */
    updateApplicationStatus: build.mutation<
      Application,
      { id: number; status: "Pending" | "Approved" | "Denied" }
    >({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApplicationsQuery,
  useCreateApplicationMutation,
  useUpdateApplicationStatusMutation,
} = applicationApi;

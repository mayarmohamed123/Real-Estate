import { Lease, Payment } from "@/types";
import { api } from "../baseApi";

// ── Lease Slice ───────────────────────────────────────────────────────────────
const leaseApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Fetch leases, optionally filtered by tenant. */
    getLeases: build.query<Lease[], { tenantCognitoId?: string }>({
      query: ({ tenantCognitoId }) => ({
        url: "/leases",
        params: tenantCognitoId ? { tenantCognitoId } : undefined,
      }),
      providesTags: ["Leases"],
    }),

    /** Fetch the payment history for a specific lease. */
    getLeasePayments: build.query<Payment[], number>({
      query: (leaseId) => ({ url: `/leases/${leaseId}/payments` }),
      providesTags: ["Leases"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLeasesQuery, useGetLeasePaymentsQuery } = leaseApi;

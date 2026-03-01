import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const landingApi = createApi({
  reducerPath: "adminLanding",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["LandingAssets"],

  endpoints: (builder) => ({

    getAssets: builder.query({
      providesTags: ["LandingAssets"],
      query: () => ({
        url: "/admin/landing",
        method: "GET"
      }),
    }),

  }),
});

export const { useGetAssetsQuery } = landingApi;
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

    uploadAsset: builder.mutation({
      invalidatesTags: ["LandingAssets"],
      query: (formData) => ({
        url: "/admin/landing",
        method: "POST",
        data: formData,
      }),
    }),

    deleteAsset: builder.mutation({
      invalidatesTags: ["LandingAssets"],
      query: (id) => ({
        url: `/admin/landing/${id}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const { useGetAssetsQuery, useUploadAssetMutation, useDeleteAssetMutation } = landingApi;
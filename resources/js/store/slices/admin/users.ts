import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "adminUsers",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users"],

  endpoints: (builder) => ({

    getUsers: builder.query({
      providesTags: ["Users"],
      query: ({ page = 1, perPage = 10 }) => ({
        url: "/admin/users",
        method: "GET",
        params: {
          page,
          per_page: perPage,
        },
      }),
    }),

    createUser: builder.mutation({
      invalidatesTags: ["Users"],
      query: (userData: FormData) => ({
        url: "/admin/users",
        method: "POST",
        data: userData,
      }),
    }),

  }),
});

export const { useGetUsersQuery, useCreateUserMutation } = usersApi;
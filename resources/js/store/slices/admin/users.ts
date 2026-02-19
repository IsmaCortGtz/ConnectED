import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "adminUsers",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Users", "User"],

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

    getUser: builder.query({
      providesTags: (_result, _error, id) => [{ type: "User", id }],
      query: (id: string) => ({
        url: `/admin/users/${id}`,
        method: "GET",
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

    updateUser: builder.mutation({
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }, "Users"],
      query: ({ id, userData }: { id: string; userData: FormData }) => ({
        url: `/admin/users/${id}`,
        method: "POST", // Using POST with _method=PUT for Laravel compatibility
        data: userData,
      }),
    }),

    deleteUser: builder.mutation({
      invalidatesTags: (_result, _error, id) => [{ type: "User", id }, "Users"],
      query: (id: string) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
    }),

    restoreUser: builder.mutation({
      invalidatesTags: (_result, _error, id) => [{ type: "User", id }, "Users"],
      query: (id: string) => ({
        url: `/admin/users/${id}/restore`,
        method: "PATCH",
      }),
    }),

  }),
});

export const { useGetUsersQuery, useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useRestoreUserMutation } = usersApi;
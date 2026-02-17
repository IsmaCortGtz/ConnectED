import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const userCoursesApi = createApi({
  reducerPath: "userCourses",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses"],

  endpoints: (builder) => ({
    getUserCourses: builder.query({
      providesTags: ["Courses"],
      query: () => ({
        url: "/user/courses",
        method: "GET",
      }),
    }),

  }),
});

export const { useGetUserCoursesQuery } = userCoursesApi;
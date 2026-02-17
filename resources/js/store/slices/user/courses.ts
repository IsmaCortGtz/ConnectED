import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const userCoursesApi = createApi({
  reducerPath: "userCourses",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses", "Course"],

  endpoints: (builder) => ({
    getUserCourses: builder.query({
      providesTags: ["Courses"],
      query: () => ({
        url: "/user/courses",
        method: "GET",
      }),
    }),

    getUserCourse: builder.query({
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
      query: (id) => ({
        url: `/user/courses/${id}`,
        method: "GET",
      }),
    }),

  }),
});

export const { useGetUserCoursesQuery, useGetUserCourseQuery } = userCoursesApi;
import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const coursesApi = createApi({
  reducerPath: "adminCourses",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses"],

  endpoints: (builder) => ({

    getCourses: builder.query({
      providesTags: ["Courses"],
      query: ({ page = 1, perPage = 10 }) => ({
        url: "/admin/courses",
        method: "GET",
        params: {
          page,
          per_page: perPage,
        },
      }),
    }),

    createCourse: builder.mutation({
      invalidatesTags: ["Courses"],
      query: (courseData: FormData) => ({
        url: "/admin/courses",
        method: "POST",
        data: courseData,
      }),
    }),

  }),
});

export const { useGetCoursesQuery, useCreateCourseMutation } = coursesApi;
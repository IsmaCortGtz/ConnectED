import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const coursesApi = createApi({
  reducerPath: "adminCourses",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Courses", "Course"],

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

    getCourse: builder.query({
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
      query: (id: string) => ({
        url: `/admin/courses/${id}`,
        method: "GET",
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

    updateCourse: builder.mutation({
      invalidatesTags: (_result, _error, { id }) => [{ type: "Course", id }, "Courses"],
      query: ({ id, courseData }: { id: string; courseData: FormData }) => ({
        url: `/admin/courses/${id}`,
        method: "POST", // Using POST with _method=PUT for Laravel compatibility
        data: courseData,
      }),
    }),

    deleteCourse: builder.mutation({
      invalidatesTags: (_result, _error, id) => [{ type: "Course", id }, "Courses"],
      query: (id: string) => ({
        url: `/admin/courses/${id}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const { useGetCoursesQuery, useGetCourseQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } = coursesApi;
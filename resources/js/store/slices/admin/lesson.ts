import { axiosBaseQuery } from "@/api/axios";
import { createApi } from "@reduxjs/toolkit/query/react";
import { coursesApi } from "./courses";

export const lessonsApi = createApi({
  reducerPath: "adminLessons",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Lessons", "Lesson"],

  endpoints: (builder) => ({

    getLessons: builder.query({
      providesTags: ["Lessons"],
      query: ({ page = 1, perPage = 10 }) => ({
        url: "/admin/lessons",
        method: "GET",
        params: {
          page,
          per_page: perPage,
        },
      }),
    }),

    getLesson: builder.query({
      providesTags: (_result, _error, id) => [{ type: "Lesson", id }],
      query: (id: string) => ({
        url: `/admin/lessons/${id}`,
        method: "GET",
      }),
     }),

    createLesson: builder.mutation({
      invalidatesTags: ["Lessons"],
      query: (lessonData: FormData) => ({
        url: "/admin/lessons",
        method: "POST",
        data: lessonData,
      }),
    }),

    updateLesson: builder.mutation({
      invalidatesTags: (_result, _error, { id }) => [{ type: "Lesson", id }, "Lessons"],
      query: ({ id, lessonData }: { id: string; lessonData: FormData }) => ({
        url: `/admin/lessons/${id}`,
        method: "POST", // Using POST with _method=PUT for Laravel compatibility
        data: lessonData,
      }),
    }),

    deleteLesson: builder.mutation({
      invalidatesTags: (_result, _error, id) => [{ type: "Lesson", id }, "Lessons"],
      query: (id: string) => ({
        url: `/admin/lessons/${id}`,
        method: "DELETE",
      }),
    }),

  }),
});

export const { useGetLessonsQuery, useGetLessonQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation } = lessonsApi;
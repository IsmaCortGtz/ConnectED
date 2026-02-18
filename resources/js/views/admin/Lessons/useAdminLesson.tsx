import Alert from "@/components/Alert";
import { useCreateLessonMutation, useUpdateLessonMutation, useGetLessonQuery } from "@/store/slices/admin/lesson";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export function useAdminLesson() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [createLesson, { isLoading: isCreateLoading }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdateLoading }] = useUpdateLessonMutation();
  const { data: lessonData, isLoading: isLessonLoading } = useGetLessonQuery(id as string, { skip: !id });
  const isEditMode = pathname.includes("edit");
  const [courses, setCourses] = useState<{ id: number, title: string }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const firstFetch = useRef(true);

  useEffect(() => {
    if (!firstFetch.current) return;
    firstFetch.current = false;

    (async () => {
      try {
        const { data } = await axios.get("/api/admin/lessons/courses");
        setLoadingCourses(false);
        setCourses(data);
      } catch (err: any) {
        Alert.error("Error", `Failed to fetch courses: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
      }
    })();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      if (isEditMode) formData.append("_method", "PUT");
      if (!formData.get("course_id")) formData.delete("course_id");
      if (!formData.get("price")) formData.delete("price");
      if (!formData.get("discount")) formData.delete("discount");
      if (!formData.get("date")) formData.delete("date");
      
      if (isEditMode) {
        await updateLesson({ id: id as string, lessonData: formData }).unwrap();
      } else {
        await createLesson(formData).unwrap();
      }

      Alert.success("Success", `Lesson ${isEditMode ? "updated" : "created"} successfully`);
      navigate("/admin/lessons");

    } catch (err: any) {
      Alert.error("Error", `Failed to ${isEditMode ? "update" : "create"} lesson: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return {
    handleSubmit,
    isLoading: isCreateLoading || isUpdateLoading || loadingCourses || isLessonLoading,
    courses,
    lessonData,
    isEditMode,
  }
}
import Alert from "@/components/Alert";
import { useCreateCourseMutation, useGetCourseQuery, useUpdateCourseMutation } from "@/store/slices/admin/courses";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export function useAdminCourse() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [createCourse, { isLoading: isCreateLoading }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdateLoading }] = useUpdateCourseMutation();
  const { data: courseData, isLoading: isCourseLoading } = useGetCourseQuery(id as string, { skip: !id });
  const isEditMode = pathname.includes("edit");
  const [professors, setProfessors] = useState<{ id: number, name: string, last_name: string }[]>([]);
  const [loadingProfessors, setLoadingProfessors] = useState(true);
  const firstFetch = useRef(true);

  useEffect(() => {
    if (!firstFetch.current) return;
    firstFetch.current = false;

    (async () => {
      try {
        const { data } = await axios.get("/api/admin/professors");
        setLoadingProfessors(false);
        setProfessors(data);
      } catch (err: any) {
        Alert.error("Error", `Failed to fetch professors: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
      }
    })();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      if (isEditMode) formData.append("_method", "PUT");
      if (!formData.get("title")) formData.delete("title");
      if (!formData.get("professor_id")) formData.delete("professor_id");
      if (!formData.get("description")) formData.delete("description");
      
      if (isEditMode) {
        await updateCourse({ id: id as string, courseData: formData }).unwrap();
      } else {
        await createCourse(formData).unwrap();
      }

      Alert.success("Success", `Course ${isEditMode ? "updated" : "created"} successfully`);
      navigate("/admin/courses");

    } catch (err: any) {
      Alert.error("Error", `Failed to ${isEditMode ? "update" : "create"} course: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return {
    handleSubmit,
    isLoading: isCreateLoading || isUpdateLoading || loadingProfessors || isCourseLoading,
    professors,
    courseData,
    isEditMode,
  }
}
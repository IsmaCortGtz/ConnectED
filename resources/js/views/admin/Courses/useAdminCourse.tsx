import Alert from "@/components/Alert";
import { useCreateCourseMutation } from "@/store/slices/admin/courses";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

export function useAdminCourse() {
  const { id } = useParams();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
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

  const createNewCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      await createCourse(formData).unwrap();
      Alert.success("Success", "Course created successfully");
      form.reset();

    } catch (err: any) {
      Alert.error("Error", `Failed to create course: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return {
    createNewCourse,
    isLoading: isLoading || loadingProfessors,
    professors,
  }
}
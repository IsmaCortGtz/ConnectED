import { useGetUserCourseQuery } from "@/store/slices/user/courses";
import { useParams } from "react-router";

export default function UserLessons() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetUserCourseQuery(id);
  
  return (
    <section>
      <h2>Lessons</h2>

      <h3>{data?.title}</h3>
      <p>{data?.description}</p>

      <img src={data?.professor?.image} alt={data?.professor?.name} />
      <span>{data?.professor?.name}</span>

    </section>
  );
}
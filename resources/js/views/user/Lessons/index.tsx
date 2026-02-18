import { useGetUserCourseQuery } from "@/store/slices/user/courses";
import { useParams } from "react-router";
import './lessons.scss';
import Avatar from "@/components/Avatar";

export default function UserLessons() {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetUserCourseQuery(id);
  
  return (
    <section>
      <header className="course-header">
        <h2 className="course-title">{data?.title}</h2>
        <p className="course-description">{data?.description}</p>
      
        <section className="course-professor">
          <Avatar className="professor-avatar" image={data?.professor?.image} text={data?.professor?.name} />
          <span className="professor-name">{data?.professor?.name}</span>
        </section>
      </header>

      <section className="lesson-list-container">
        <p>hola</p>
      </section>

    </section>
  );
}
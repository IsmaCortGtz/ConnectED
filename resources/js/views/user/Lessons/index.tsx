import { useGetUserCourseQuery } from "@/store/slices/user/courses";
import { useNavigate, useParams } from "react-router";
import './lessons.scss';
import Avatar from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

export default function UserLessons() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data } = useGetUserCourseQuery(id);
  
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
        
        {data?.lessons?.map((lesson: any, idx: number) => (
          <article className="lesson-item">
            <div className="left-side">
              <h4>Lesson #{data?.lessons?.length - idx}</h4>
              <span>{
                new Date(lesson.date).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  minute: '2-digit',
                  hour: '2-digit',
                })
              }</span>
            </div>

            <Button onClick={() => navigate(`/video-call/${lesson.key}`)} btnSize="tiny" btnLevel="success">
              <Icon icon="videocam" />
            </Button>
          </article>
        ))}

        {data?.lessons?.length === 0 && (
          <div className="no-lessons">
            <p>No lessons available yet.</p>
          </div>
        )}

      </section>

    </section>
  );
}
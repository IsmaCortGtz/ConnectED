import { useGetUserCoursesQuery } from '@/store/slices/user/courses';
import './courses.scss';
import CourseCard from '@/components/CourseCard';

export function UserCourses() {
  const { data } = useGetUserCoursesQuery(undefined);
  return (
    <section>
      <h2>Discover Courses</h2>

      <section className="course-grid-container">

        {data?.map((course: any) => (
          <CourseCard
            key={`discover-course-${course.id}`}
            imageUrl={course.image}
            lessons={course.lessons_count}
            professor={course.professor}
            rating={course.rating}
            title={course.title}
          />
        ))}

      </section>
    </section>
  );
}
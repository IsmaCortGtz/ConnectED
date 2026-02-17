import { Icon } from "../Icon";
import './course_card.scss';

export interface CourseCardProps {
  title: string;
  professor: string;
  lessons: number;
  rating: number;
  imageUrl: string;
  onClick?: () => void;
}

export default function CourseCard(props: CourseCardProps) {
  return (
    <article className="course-card" onClick={props.onClick}>
      <img className="course-image" src={props.imageUrl} alt="" />

      <div className='course-content'>
        <h3>{props.title}</h3>
        <div className='description-container'>
          <div className='left-side'>
            <span className='professor'>{props.professor}</span>
            <span className='lessons'>{props.lessons} Lessons</span>
          </div>
          <span className='rating'>
            <Icon icon='star' />
            {props.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
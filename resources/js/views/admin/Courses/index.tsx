import './admin_courses.scss';
import { useGetCoursesQuery } from '@/store/slices/admin/courses';
import { Table } from '@/components/Table';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';

export function AdminCourses() {
  const navigate = useNavigate();

  return (
    <section>
      <h1 className='admin-section-title'>
        Manage Courses
        <Button onClick={() => navigate("create")}>
          <Icon icon='add' />
          New Course
        </Button>
      </h1>

      <Table
        tableClassName='admin-courses-table'
        useQuery={useGetCoursesQuery}
        structure={[
          {
            label: '#',
            key: 'id',
            fitContent: true,
          },
          {
            label: 'Title',
            key: 'title',
          },
          {
            label: 'Description',
            key: 'description',
          },
          {
            label: 'Actions',
            className: 'actions',
            fitContent: true,
            render: (_row) => (<div className='actions'>
              <Button btnLevel='success' btnSize='tiny'>
                <Icon icon='edit' />
              </Button>
              <Button btnLevel='error' btnSize='tiny'>
                <Icon icon='delete' />
              </Button>
            </div>),
          }
        ]}
      />
    </section>
  );
}
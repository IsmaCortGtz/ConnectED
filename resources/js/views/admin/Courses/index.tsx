import './admin_courses.scss';
import { useDeleteCourseMutation, useGetCoursesQuery, useRestoreCourseMutation } from '@/store/slices/admin/courses';
import { Table } from '@/components/Table';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';
import useTableActions from '@/hooks/useTableActions';

export function AdminCourses() {
  const navigate = useNavigate();
  const [deleteCourse] = useDeleteCourseMutation();
  const [restoreCourse] = useRestoreCourseMutation();
  const { handleDelete, handleRestore } = useTableActions('course');

  return (
    <section>
      <h1 className='admin-section-title'>
        Manage Courses

        <div className='buttons'>
          <Button onClick={() => navigate("create")}>
            <Icon icon='add' />
            New Course
          </Button>
          <Button btnLevel='success' onClick={() => window.open('/print/courses', '_blank')}>
            <Icon icon='docs' />
            Generate PDF
          </Button>
        </div>
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
            render: (row) => (<div className='actions'>
              <Button onClick={() => navigate(`edit/${row.id}`)} btnLevel='success' btnSize='tiny'>
                <Icon icon='edit' />
              </Button>
              {row.deleted_at ? (
                <Button onClick={handleRestore(row.id, restoreCourse)} btnLevel='warning' title='Restore' btnSize='tiny'>
                  <Icon icon='logout' />
                </Button>
              ) : (
                <Button onClick={handleDelete(row.id, deleteCourse)} btnLevel='error' title='Delete' btnSize='tiny'>
                  <Icon icon='delete' />
                </Button>
              )}
            </div>),
          }
        ]}
      />
    </section>
  );
}
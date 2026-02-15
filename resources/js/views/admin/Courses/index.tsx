import './admin_courses.scss';
import { useDeleteCourseMutation, useGetCoursesQuery } from '@/store/slices/admin/courses';
import { Table } from '@/components/Table';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';
import { useRef } from 'react';
import Alert from '@/components/Alert';

export function AdminCourses() {
  const navigate = useNavigate();
    const [deleteCourse] = useDeleteCourseMutation();
    const deleteRef = useRef(false);
  
    const handleDelete = (id: string) => {
      return async () => {
        Alert.warning('Confirm Deletion', 'Are you sure you want to delete this course?', [
          {
            label: 'Cancel',
            type: 'outlined',
            onClick: (close) => close(),
          },
          {
            label: 'Delete',
            type: 'filled',
            onClick: async (close) => {
              if (deleteRef.current) return; // Prevent multiple clicks
              deleteRef.current = true;
              try {
                await deleteCourse(id).unwrap();
                Alert.success('Course Deleted', 'The course has been successfully deleted.');
                close();
              } catch (error) {
                Alert.error('Deletion Failed', 'An error occurred while deleting the course.');
              } finally {
                deleteRef.current = false;
              }
            }
          }
        ]);
      };
    };

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
            render: (row) => (<div className='actions'>
              <Button onClick={() => navigate(`edit/${row.id}`)} btnLevel='success' btnSize='tiny'>
                <Icon icon='edit' />
              </Button>
              <Button onClick={handleDelete(row.id)} btnLevel='error' btnSize='tiny'>
                <Icon icon='delete' />
              </Button>
            </div>),
          }
        ]}
      />
    </section>
  );
}
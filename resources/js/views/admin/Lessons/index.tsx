import './admin_lessons.scss';
import Alert from "@/components/Alert";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Table } from "@/components/Table";
import { useDeleteLessonMutation, useGetLessonsQuery } from "@/store/slices/admin/lesson";
import { useRef } from "react";
import { useNavigate } from "react-router";

export default function AdminLessons() {
  const navigate = useNavigate();
  const [deleteLesson] = useDeleteLessonMutation();
  const deleteRef = useRef(false);

  const handleDelete = (id: string) => {
    return async () => {
      Alert.warning('Confirm Deletion', 'Are you sure you want to delete this lesson?', [
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
              await deleteLesson(id).unwrap();
              Alert.success('Lesson Deleted', 'The lesson has been successfully deleted.');
              close();
            } catch (error) {
              Alert.error('Deletion Failed', 'An error occurred while deleting the lesson.');
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
        Manage Lessons
        <Button onClick={() => navigate("create")}>
          <Icon icon='add' />
          New Lesson
        </Button>
      </h1>

      <Table
        tableClassName='admin-lessons-table'
        useQuery={useGetLessonsQuery}
        structure={[
          {
            label: '#',
            key: 'id',
            fitContent: true,
          },
          {
            label: 'Course',
            key: 'course',
          },
          {
            label: 'Price ($ MXN)',
            key: 'price',
          },
          {
            label: 'Discount (%)',
            key: 'discount',
          },
          {
            label: 'Date',
            key: 'date',
            render: (row) => new Date(row.date).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              minute: '2-digit',
              hour: '2-digit',
            }),
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
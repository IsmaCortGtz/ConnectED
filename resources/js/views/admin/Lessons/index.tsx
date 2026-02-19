import './admin_lessons.scss';
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Table } from "@/components/Table";
import useTableActions from '@/hooks/useTableActions';
import { useDeleteLessonMutation, useGetLessonsQuery, useRestoreLessonMutation } from "@/store/slices/admin/lesson";
import { useNavigate } from "react-router";

export default function AdminLessons() {
  const navigate = useNavigate();
  const [deleteLesson] = useDeleteLessonMutation();
  const [restoreLesson] = useRestoreLessonMutation();
  const { handleDelete, handleRestore } = useTableActions('lesson');

  return (
    <section>
      <h1 className='admin-section-title'>
        Manage Lessons

        <div className='buttons'>
          <Button onClick={() => navigate("create")}>
            <Icon icon='add' />
            New Lesson
          </Button>
          <Button btnLevel='success' onClick={() => window.open('/print/lessons', '_blank')}>
            <Icon icon='docs' />
            Generate PDF
          </Button>
        </div>
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
              {row.deleted_at ? (
                <Button onClick={handleRestore(row.id, restoreLesson)} btnLevel='warning' title='Restore' btnSize='tiny'>
                  <Icon icon='logout' />
                </Button>
              ) : (
                <Button onClick={handleDelete(row.id, deleteLesson)} btnLevel='error' title='Delete' btnSize='tiny'>
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
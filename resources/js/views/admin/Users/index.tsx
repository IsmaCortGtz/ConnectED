import './admin_users.scss';
import { useDeleteUserMutation, useGetUsersQuery, useRestoreUserMutation } from '@/store/slices/admin/users';
import { Table } from '@/components/Table';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';
import useTableActions from '@/hooks/useTableActions';

export function AdminUsers() {
  const navigate = useNavigate();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const { handleDelete, handleRestore } = useTableActions('user');

  return (
    <section>
      <h1 className='admin-section-title'>
        Manage Users
        <Button onClick={() => navigate("create")}>
          <Icon icon='add' />
          New User
        </Button>
      </h1>

      <Table
        tableClassName='admin-users-table'
        useQuery={useGetUsersQuery}
        structure={[
          {
            label: '#',
            key: 'id',
            fitContent: true,
          },
          {
            label: 'Name',
            render: (row) => `${row.name} ${row.last_name}`,
          },
          {
            label: 'Email',
            key: 'email',
          },
          {
            label: 'Role',
            key: 'role',
            className: 'role',
          },
          {
            label: 'Actions',
            className: 'actions',
            fitContent: true,
            render: (row) => (<div className='actions'>
              <Button onClick={() => navigate(`edit/${row.id}`)} btnLevel='success' title='Edit' btnSize='tiny'>
                <Icon icon='edit' />
              </Button>
              {row.deleted_at ? (
                <Button onClick={handleRestore(row.id, restoreUser)} btnLevel='warning' title='Restore' btnSize='tiny'>
                  <Icon icon='logout' />
                </Button>
              ) : (
                <Button onClick={handleDelete(row.id, deleteUser)} btnLevel='error' title='Delete' btnSize='tiny'>
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
import './admin_users.scss';
import { useDeleteUserMutation, useGetUsersQuery } from '@/store/slices/admin/users';
import { Table } from '@/components/Table';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useNavigate } from 'react-router';
import Alert from '@/components/Alert';
import { useRef } from 'react';

export function AdminUsers() {
  const navigate = useNavigate();
  const [deleteUser] = useDeleteUserMutation();
  const deleteRef = useRef(false);

  const handleDelete = (id: string) => {
    return async () => {
      Alert.warning('Confirm Deletion', 'Are you sure you want to delete this user?', [
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
              await deleteUser(id).unwrap();
              Alert.success('User Deleted', 'The user has been successfully deleted.');
              close();
            } catch (error) {
              Alert.error('Deletion Failed', 'An error occurred while deleting the user.');
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
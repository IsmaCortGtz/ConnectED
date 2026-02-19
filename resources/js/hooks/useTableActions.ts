import Alert from "@/components/Alert";
import { useRef } from "react";

export default function useTableActions(which: string) {
  const actionRef = useRef(false);

  const handleDelete = (id: string, mutation: any) => {
    return async () => {
      Alert.warning('Confirm Deletion', `Are you sure you want to delete this ${which}?`, [
        {
          label: 'Cancel',
          type: 'outlined',
          onClick: (close) => close(),
        },
        {
          label: 'Delete',
          type: 'filled',
          onClick: async (close) => {
            if (actionRef.current) return; // Prevent multiple clicks
            actionRef.current = true;
            try {
              await mutation(id).unwrap();
              Alert.success(`${which.slice(0, 1).toUpperCase() + which.slice(1)} Deleted`, `The ${which} has been successfully deleted.`);
              close();
            } catch (error) {
              Alert.error('Deletion Failed', `An error occurred while deleting the ${which}.`);
            } finally {
              actionRef.current = false;
            }
          }
        }
      ]);
    };
  };

  const handleRestore = (id: string, mutation: any) => {
    return async () => {
      Alert.warning('Confirm Restoration', `Are you sure you want to restore this ${which}?`, [
        {
          label: 'Cancel',
          type: 'outlined',
          onClick: (close) => close(),
        },
        {
          label: 'Restore',
          type: 'filled',
          onClick: async (close) => {
            if (actionRef.current) return; // Prevent multiple clicks
            actionRef.current = true;
            try {
              await mutation(id).unwrap();
              Alert.success(`${which.slice(0, 1).toUpperCase() + which.slice(1)} Restored`, `The ${which} has been successfully restored.`);
              close();
            } catch (error) {
              Alert.error('Restoration Failed', `An error occurred while restoring the ${which}.`);
            } finally {
              actionRef.current = false;
            }
          }
        }
      ]);
    };
  };

  return { handleDelete, handleRestore };
}
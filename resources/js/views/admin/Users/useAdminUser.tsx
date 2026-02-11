import Alert from "@/components/Alert";
import { useCreateUserMutation } from "@/store/slices/admin/users";

export function useAdminUser() {
  const [createUser, { isLoading, isSuccess, isError, error }] = useCreateUserMutation();

  const createNewUser = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      
      await createUser(formData).unwrap();
      Alert.success("Success", "User created successfully");
      form.reset();

    } catch (err: any) {
      Alert.error("Error", `Failed to create user: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return {
    createNewUser,
    isLoading,
  }
}
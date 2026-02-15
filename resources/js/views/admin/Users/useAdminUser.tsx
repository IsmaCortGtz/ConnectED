import Alert from "@/components/Alert";
import { useCreateUserMutation, useGetUserQuery, useUpdateUserMutation } from "@/store/slices/admin/users";
import { useLocation, useNavigate, useParams } from "react-router";

export function useAdminUser() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [createUser, { isLoading: isCreateLoading, isSuccess: isCreateSuccess, isError: isCreateError, error: createError }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdateLoading, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useUpdateUserMutation();
  const { data: userData, isLoading: isUserLoading } = useGetUserQuery(id as string, { skip: !id });

  const isEditMode = pathname.includes("edit");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);

      if (isEditMode) formData.append("_method", "PUT"); // For Laravel to recognize it as an update request
      
      if (!formData.get("name")) formData.delete("name");
      if (!formData.get("last_name")) formData.delete("last_name");
      if (!formData.get("email")) formData.delete("email");
      if (!formData.get("role")) formData.delete("role");
      if (!formData.get("password")) formData.delete("password");
      if (!formData.get("password_confirmation")) formData.delete("password_confirmation");
      
      if (isEditMode) {
        await updateUser({ id: id as string, userData: formData }).unwrap();
      } else {
        await createUser(formData).unwrap();
      }
      Alert.success("Success", `User ${isEditMode ? "updated" : "created"} successfully`);
      navigate("/admin/users");

    } catch (err: any) {
      Alert.error("Error", `Failed to ${isEditMode ? "update" : "create"} user: ${err?.data?.message || err.message || 'Unknown error'}`);
    }
  };

  return {
    handleSubmit,
    userData,
    isEditMode,
    isUserLoading,
    isCreateLoading,
    isUpdateLoading,
  }
}
import Alert from "@/components/Alert";
import { useModal } from "@/components/Modal";
import { useUploadAssetMutation, useDeleteAssetMutation } from "@/store/slices/admin/landing";

export function useLanding() {
  const [uploadAsset, { isLoading }] = useUploadAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const { close } = useModal();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      await uploadAsset(formData).unwrap();
      Alert.success('Asset uploaded successfully', 'The asset has been uploaded successfully.');

      close('admin-landing-upload-image');
      close('admin-landing-upload-video');

    } catch (error: any) {
      Alert.error('Error uploading asset', error?.data?.message || 'An error occurred while uploading the asset. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      Alert.warning(
        'Delete asset', 
        'Are you sure you want to delete this asset? This action cannot be undone.',
        [
          { label: 'Cancel', type: 'outlined', onClick: (close) => close() },
          { label: 'Delete', type: 'filled', onClick: async (close) => {
            try {
              await deleteAsset(id).unwrap();
              Alert.success('Asset deleted successfully', 'The asset has been deleted successfully.');
            } catch (error: any) {
              Alert.error('Error deleting asset', error?.data?.message || 'An error occurred while deleting the asset. Please try again.');
            } finally {
              close();
            }
          }},
        ]
      );

    } catch (error: any) {
      Alert.error('Error deleting asset', error?.data?.message || 'An error occurred while deleting the asset. Please try again.');
    }
  }

  return { isUploading: isLoading, handleUpload, handleDelete };
}
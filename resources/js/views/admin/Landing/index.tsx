import { Input } from '@/components/Input';
import './admin_landing.scss';
import { useGetAssetsQuery } from '@/store/slices/admin/landing';

export function AdminLanding() {
  const { data, isLoading, isError } = useGetAssetsQuery({});

  return (
    <section className="admin-manage-landing-assets-section">
      <h2 className='admin-section-title'>Images</h2>
      hola

      <h2 className='admin-section-title'>Video</h2>
      <Input name='video' id='video-input' type='file' />
      {data?.video?.url && <video className='video-placeholder' src={data?.video?.url} />}

    </section>
  );
}
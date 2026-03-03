import { Input } from '@/components/Input';
import './admin_landing.scss';
import { useGetAssetsQuery, useUploadAssetMutation } from '@/store/slices/admin/landing';
import { Modal, useModal } from '@/components/Modal';
import { motion } from 'framer-motion';
import { animationConfig } from '@/config/animations';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useLanding } from './useLanding';

export function AdminLanding() {
  const { open } = useModal();
  const { data } = useGetAssetsQuery(undefined);
  const { handleUpload, handleDelete, isUploading } = useLanding();

  return (
    <section className="admin-manage-landing-assets-section">

      {/* Modals */}
      <Modal id='admin-landing-upload-video' closeBtn>
        <h2>Upload video</h2>
        <form className='upload-form' onSubmit={handleUpload}>
          <input type="hidden" name='type' value='video' />
          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Video
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input type='file' id='video-file' name='file' accept='video/*' required />
            </motion.div>
          </motion.div>

          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Description
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input id="description" name="description" placeholder="Description" required />
            </motion.div>
          </motion.div>

          <Button loading={isUploading} type='submit'>
            <Icon icon='save' />
            Upload video
          </Button>
        </form>
      </Modal>

      <Modal id='admin-landing-upload-image' closeBtn>
        <h2>Upload Image</h2>
        <form className='upload-form' onSubmit={handleUpload}>
          <input type="hidden" name='type' value='image' />
          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Image
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input type='file' id='image-file' name='file' accept='image/*' required />
            </motion.div>
          </motion.div>

          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Description
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input id="description" name="description" placeholder="Description" required />
            </motion.div>
          </motion.div>

          <Button loading={isUploading} type='submit'>
            <Icon icon='save' />
            Upload image
          </Button>
        </form>
      </Modal>

      <h2 className='admin-section-title'>Images</h2>
      <section className='images-section'>
        {data?.images?.map((image: any) => (
          <div key={image.id} className='image-container'>
            <img className='image-item' src={image.url} alt={image.description} />

            <Button className='delete-icon' btnLevel='error' btnSize='tiny' onClick={() => handleDelete(image.id)}>
              <Icon icon='delete' />
            </Button>
          </div>
        ))}

        <div className='add-asset' onClick={() => open('admin-landing-upload-image')}>
          <span className='add-asset-icon'>+</span>
        </div>
      </section>

      <h2 className='admin-section-title'>Video</h2>

      {!!data?.video?.url ? (
        <div className='video-container'>
          <video className='video-item' src={data?.video?.url} controls />

          <Button className='delete-icon' btnLevel='error' btnSize='tiny' onClick={() => handleDelete(data?.video?.id)}>
            <Icon icon='delete' />
          </Button>
        </div>
      ) : (
        <div className='add-asset' onClick={() => open('admin-landing-upload-video')}>
          <span className='add-asset-icon'>+</span>
        </div>
      )}

    </section>
  );
}
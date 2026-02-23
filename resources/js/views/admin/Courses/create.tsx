import './admin_courses.scss';
import { Input } from "@/components/Input";
import { animationConfig } from "@/config/animations";
import { motion } from "framer-motion";
import { useAdminCourse } from "./useAdminCourse";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/Select";
import { Textarea } from '@/components/Textarea';

export function AdminCreateCourse() {
  const { handleSubmit, professors, courseData, isLoading, isEditMode } = useAdminCourse();

  return (
    <section className="admin-create-course-section">
      <h1 className='admin-section-title'>{isEditMode ? "Edit" : "Create"} Course</h1>

      <form onSubmit={handleSubmit} className="admin-form">

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Title
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input id="title" name="title" placeholder="Title" required defaultValue={courseData?.title || ""} />
          </motion.div>
        </motion.div>

        <motion.div className="select" variants={animationConfig.input}>
          <motion.label
            htmlFor="professor_id"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Professor
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Select 
              key={`course-professor-${courseData?.professor_id || "new"}-list-${professors.length}`} 
              name="professor_id" id="professor_id" 
              defaultValue={courseData?.professor_id || ""} 
              disabled={professors.length === 0} 
              required
            >
              <option value="" disabled>-- Select a professor --</option>
              {professors.map(professor => (
                <option key={professor.id} value={professor.id}>
                  {professor.name} {professor.last_name}
                </option>
              ))}
            </Select>
          </motion.div>
        </motion.div>

        <motion.div className="textarea" variants={animationConfig.input}>
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
            <Textarea id="description" name="description" placeholder="Description" defaultValue={courseData?.description || ""} required />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="image"
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
            <Input id="image" name="image" placeholder="Image" type="file" />
          </motion.div>
        </motion.div>

        <Button type="submit" loading={isLoading}>
          <Icon icon="save" />
          {isEditMode ? "Update Course" : "Create Course"}
        </Button>
      </form>
    </section>
  );
}
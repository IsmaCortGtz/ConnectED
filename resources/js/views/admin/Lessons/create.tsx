import './admin_lessons.scss';
import { Input } from "@/components/Input";
import { animationConfig } from "@/config/animations";
import { motion } from "framer-motion";
import { useAdminLesson } from "./useAdminLesson";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/Select";
import { Textarea } from '@/components/Textarea';

export function AdminCreateLesson() {
  const { handleSubmit, courses, lessonData, isLoading, isEditMode } = useAdminLesson();

  return (
    <section className="admin-create-lesson-section">
      <h1 className='admin-section-title'>{isEditMode ? "Edit" : "Create"} Lesson</h1>

      <form onSubmit={handleSubmit} className="admin-form">

        <motion.div className="select" variants={animationConfig.input}>
          <motion.label
            htmlFor="course_id"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Course
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Select
              key={`lesson-courses-${lessonData?.course_id || "new"}-list-${courses.length}`}
              name="course_id" id="course_id"
              defaultValue={lessonData?.course_id || ""}
              disabled={courses.length === 0}
              required
            >
              <option value="" disabled>-- Select a course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </Select>
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="price"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Price (MXN)
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input id="price" name="price" placeholder="Price" type='number' required defaultValue={lessonData?.price || ""} />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="discount"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Discount (%)
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input id="discount" name="discount" placeholder="Discount" type='number' required defaultValue={lessonData?.discount || ""} />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Date
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input id="date" name="date" placeholder="Date" type='datetime-local' required defaultValue={lessonData?.date || ""} />
          </motion.div>
        </motion.div>

        <Button type="submit" loading={isLoading}>
          <Icon icon="save" />
          {isEditMode ? "Update Lesson" : "Create Lesson"}
        </Button>
      </form>
    </section>
  );
}
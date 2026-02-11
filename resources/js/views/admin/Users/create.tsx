import { Input } from "@/components/Input";
import { animationConfig } from "@/config/animations";
import { motion } from "framer-motion";
import { useAdminUser } from "./useAdminUser";
import './admin_users.scss';
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/Select";

export function AdminCreateUser() {
  const { createNewUser, isLoading } = useAdminUser();

  return (
    <section className="admin-create-user-section">
      <h1 className='admin-section-title'>Create New User</h1>

      <form onSubmit={createNewUser} className="admin-form">
        <div className="input-group">
          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Name
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input id="name" name="name" placeholder="Name" required />
            </motion.div>
          </motion.div>

          <motion.div className="input" variants={animationConfig.input}>
            <motion.label
              htmlFor="last_name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
            >
              Last Name
            </motion.label>
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
            >
              <Input id="last_name" name="last_name" placeholder="Last Name" required />
            </motion.div>
          </motion.div>
        </div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Email
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input id="email" name="email" placeholder="Email" required />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Password
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Input id="password" name="password" placeholder="Password" type="password" required />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="password_confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Password Confirmation
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Input id="password_confirmation" name="password_confirmation" placeholder="Confirm Password" type="password" required />
          </motion.div>
        </motion.div>

        <motion.div className="select" variants={animationConfig.input}>
          <motion.label
            htmlFor="role"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Role
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Select name="role" id="role" defaultValue="student" required>
              <option value="administrator">Administrator</option>
              <option value="professor">Professor</option>
              <option value="student">Student</option>
            </Select>
          </motion.div>
        </motion.div>

        <Button type="submit" loading={isLoading}>
          <Icon icon="save" />
          Create User
        </Button>
      </form>
    </section>
  );
}
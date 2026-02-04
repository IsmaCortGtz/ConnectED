import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { ConnectED } from "@/components/ConnectED";
import '../Login/login.scss';
import { Link, Navigate, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { animationConfig } from "@/config/animations";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const MotionLink = motion.create(Link);



export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) navigate('/');
  }, [user?.id, navigate]);
  
  return (
    <motion.section
      className="authentication-section-container"
      variants={animationConfig.container}
      initial="hidden"
      animate="visible"
    >
      <motion.form onSubmit={register} variants={animationConfig.container}>
        <ConnectED
          variants={animationConfig.header}
          className="header"
          color="blue"
        />

        <motion.div className="title" variants={animationConfig.title}>
          <h2>Sign Up</h2>
          <motion.p className="description" variants={animationConfig.description}>
            Create a new account to start your journey with ConnectED and our community of learners
          </motion.p>
        </motion.div>
        
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
            <Input name="name" placeholder="Name" required />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="last_name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.passwordLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Last Name
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.passwordField, duration: 0.15 }}
          >
            <Input name="last_name" placeholder="Last Name" required />
          </motion.div>
        </motion.div>

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
            <Input name="email" placeholder="Email" required />
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
            <Input name="password" placeholder="Password" type="password" required />
          </motion.div>
        </motion.div>

        <motion.div className="input" variants={animationConfig.input}>
          <motion.label
            htmlFor="password_confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: animationConfig.delays.emailLabel, ...animationConfig.inputLabel.visible.transition }}
          >
            Confirm Password
          </motion.label>
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationConfig.delays.emailField, duration: 0.15 }}
          >
            <Input name="password_confirmation" placeholder="Confirm Password" type="password" required />
          </motion.div>
        </motion.div>

        <Button
          type="submit"
          variants={animationConfig.button}
        >
          <Icon icon="person" />
          Sign Up
        </Button>
        
        <motion.p className="register" variants={animationConfig.link}>
          You already have an account?{" "}
          <MotionLink
            className="link"
            to="/login"
            whileHover={animationConfig.link.hover}
            style={{ display: "inline-block" }}
          >
            Sign In
          </MotionLink>
        </motion.p>
      </motion.form>
    </motion.section>
  );
}
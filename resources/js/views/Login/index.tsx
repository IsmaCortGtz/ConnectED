import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { useAuth } from "@/hooks/useAuth";
import { ConnectED } from "@/components/ConnectED";
import { Link, Navigate, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { animationConfig } from "@/config/animations";
import './login.scss';
import { useEffect } from "react";

const MotionLink = motion.create(Link);


export default function LoginPage() {
  const { login, user } = useAuth();
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
      <motion.form onSubmit={login} variants={animationConfig.container}>
        <ConnectED
          variants={animationConfig.header}
          className="header"
          color="blue"
        />

        <motion.div className="title" variants={animationConfig.title}>
          <h2>Sign In</h2>
          <motion.p className="description" variants={animationConfig.description}>
            Use your account credentials to sign in and start your journey with ConnectED
          </motion.p>
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

        <Button
          type="submit"
          variants={animationConfig.button}
        >
          <Icon icon="person" />
          Sign In
        </Button>

        {/* Registro link animado */}
        <motion.p className="register" variants={animationConfig.link}>
          Don't have an account?{" "}
          <MotionLink
            className="link"
            to="/register"
            whileHover={animationConfig.link.hover}
            style={{ display: "inline-block" }}
          >
            Sign Up
          </MotionLink>
        </motion.p>
      </motion.form>
    </motion.section>
  );
}
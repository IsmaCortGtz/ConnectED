import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { ConnectED } from "@/components/ConnectED";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { animationConfig } from "@/config/animations";
import axios from "axios";
import { FormEvent, useState } from "react";
import './forgot-password.scss';

const MotionLink = motion.create(Link);

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      
      setMessage({ type: 'success', text: data.message || 'Password reset link sent to your email' });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <motion.section
      className="authentication-section-container"
      variants={animationConfig.container}
      initial="hidden"
      animate="visible"
    >
      <motion.form onSubmit={handleSubmit} variants={animationConfig.container}>
        <ConnectED
          variants={animationConfig.header}
          className="header"
          color="blue"
        />

        <motion.div className="title" variants={animationConfig.title}>
          <h2>Forgot Password</h2>
          <motion.p className="description" variants={animationConfig.description}>
            Enter your email address and we'll send you a link to reset your password
          </motion.p>
        </motion.div>

        {message && (
          <motion.div 
            className={`message ${message.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Icon icon={message.type === 'success' ? 'check_circle' : 'error'} />
            {message.text}
          </motion.div>
        )}

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
            <Input name="email" placeholder="Email" type="email" required />
          </motion.div>
        </motion.div>

        <Button
          type="submit"
          variants={animationConfig.button}
          disabled={loading}
        >
          <Icon icon="mail" />
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to Login link */}
        <motion.p className="register" variants={animationConfig.link}>
          Remember your password?{" "}
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

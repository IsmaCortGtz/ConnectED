import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Input } from "@/components/Input";
import { ConnectED } from "@/components/ConnectED";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { animationConfig } from "@/config/animations";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import './reset-password.scss';

const MotionLink = motion.create(Link);

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tokenValid, setTokenValid] = useState(false);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!email || !token) {
        setMessage({ type: 'error', text: 'Invalid reset link' });
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        await axios.post('/api/auth/verify-token', { email, token });
        setTokenValid(true);
        setValidating(false);
      } catch (error: any) {
        setValidating(false);
        setTokenValid(false);
        const errorMessage = error.response?.data?.message || 'Invalid or expired token';
        setMessage({ type: 'error', text: errorMessage });
      }
    };

    verifyToken();
  }, [email, token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const password_confirmation = formData.get('password_confirmation') as string;

    if (password !== password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await axios.get('/sanctum/csrf-cookie');
      const { data } = await axios.post('/api/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation,
      });
      
      setMessage({ type: 'success', text: data.message || 'Password reset successfully' });
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  if (validating) {
    return (
      <motion.section
        className="authentication-section-container"
        variants={animationConfig.container}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="validating" variants={animationConfig.container}>
          <Icon icon="hourglass_empty" />
          <p>Validating reset token...</p>
        </motion.div>
      </motion.section>
    );
  }

  if (!tokenValid) {
    return (
      <motion.section
        className="authentication-section-container"
        variants={animationConfig.container}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="error-container" variants={animationConfig.container}>
          <Icon icon="error" />
          <h2>Invalid or Expired Link</h2>
          <p>{message?.text || 'This password reset link is invalid or has expired.'}</p>
          <MotionLink
            className="button-link"
            to="/forgot-password"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Request New Link
          </MotionLink>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="authentication-section-container"
      initial="hidden"
      animate="visible"
      variants={animationConfig.container}
    >
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ConnectED
          className="header"
          color="blue"
        />

        <div className="title">
          <h2>Reset Password</h2>
          <p className="description">
            Enter your new password below
          </p>
        </div>

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

        <div className="input">
          <label htmlFor="password">
            New Password
          </label>
          <div>
            <Input name="password" placeholder="New Password" type="password" required minLength={8} />
          </div>
        </div>

        <div className="input">
          <label htmlFor="password_confirmation">
            Confirm New Password
          </label>
          <div>
            <Input name="password_confirmation" placeholder="Confirm Password" type="password" required minLength={8} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
        >
          <Icon icon="lock_reset" />
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

        {/* Back to Login link */}
        <p className="register">
          <MotionLink
            className="link"
            to="/login"
            whileHover={animationConfig.link?.hover || { scale: 1.05 }}
            style={{ display: "inline-block" }}
          >
            Back to Sign In
          </MotionLink>
        </p>
      </motion.form>
    </motion.section>
  );
}

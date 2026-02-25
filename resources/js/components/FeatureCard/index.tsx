import { motion } from 'framer-motion';
import { Icon } from '../Icon';
import './feature_card.scss';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.article
      className="feature-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <motion.div 
        className="icon-wrapper"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        <Icon icon={icon} />
      </motion.div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.article>
  );
}

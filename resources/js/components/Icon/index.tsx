import { motion, HTMLMotionProps } from 'framer-motion';

export interface IconProps extends HTMLMotionProps<"img"> {
  icon: string;
}

export function Icon({ icon, className, ... props }: IconProps) {
  return <motion.img 
    {...props}  
    src={`/assets/icons/${icon}.svg`}
    alt={`icon-${icon}`}
    className={`icon-component icon ${className}`}
  />;
}
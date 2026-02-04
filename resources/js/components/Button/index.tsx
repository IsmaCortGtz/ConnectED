import './button.scss';
import { motion, HTMLMotionProps } from 'framer-motion';

export type ButtonType = 'filled' | 'outlined' | 'text';
export type ButtonLevel = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BtnSize = 'regular' | 'tiny';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  loading?: boolean;
  btnType?: ButtonType;
  btnLevel?: ButtonLevel;
  btnSize?: BtnSize;
  fullWidth?: boolean;
}

export function Button({ loading, className, btnType, btnSize, btnLevel, fullWidth, onClick, onDoubleClick, ...props }: ButtonProps) {
  return <motion.button 
    {...props}
    whileTap={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    onClick={loading ? undefined : onClick} 
    onDoubleClick={loading ? undefined : onDoubleClick}
    className={`button-component ${className ?? ''} ${loading ? 'loading' : ''} type-${btnType ?? 'filled'} level-${btnLevel ?? 'primary'} ${fullWidth ? 'full-width' : ''} size-${btnSize ?? 'regular'}`} 
    type={props.type ?? 'button'}
  />;
}
import { useState } from 'react';
import { Button } from '../Button';
import './input.scss';
import { Icon } from '../Icon';
import { HTMLMotionProps, motion } from 'framer-motion';

export interface InputProps extends HTMLMotionProps<"input"> {}

export function Input(props: InputProps) {
  const [passwordType, setPasswordType] = useState<'password' | 'text'>('password');
  
  if (props.type === 'password') {
    return <div className='input-password-component'>
      <motion.input {...props} className={`input-component type-password ${props.className}`} type={passwordType} />
      <Button className='password-toggle-btn' onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}>
        <Icon icon={passwordType === 'password' ? 'visibility' : 'visibility-off'} />
      </Button>
    </div>
  }

  return <motion.input {...props} className={`input-component ${props.className}`} />;
}
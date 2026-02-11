import { HTMLMotionProps, motion } from "framer-motion";
import "./textarea.scss";

export interface TextareaProps extends HTMLMotionProps<"textarea"> {}

export function Textarea(props: TextareaProps) {
  return <motion.textarea className="textarea-component" {...props} />;
}

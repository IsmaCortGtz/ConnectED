import { HTMLMotionProps, motion } from "framer-motion";
import "./select.scss";

export interface SelectProps extends HTMLMotionProps<"select"> {}

export function Select(props: SelectProps) {
  return <motion.select className="select-component" {...props} />;
}
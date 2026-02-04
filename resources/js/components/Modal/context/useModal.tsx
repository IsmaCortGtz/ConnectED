import { useContext } from "react";
import { ModalContext } from "./context";
import '../modal.scss';

export function useModal() {
  return useContext(ModalContext);
}
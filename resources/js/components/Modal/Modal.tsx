import { useEffect } from "react";
import { ModalItem } from "./context/context";
import { useModal } from "./context/useModal";

export interface ModalProps {
  id: string;
  closeBtn?: boolean;
  closeOut?: boolean;
  children: React.ReactNode;
  data?: any;
  onClickOut?: (id: string) => unknown;
  onClose?: (id: string) => unknown;
  onOpen?: (id: string) => unknown;
} 

export function Modal(item: ModalProps) {
  const { createModal } = useModal();

  useEffect(() => {
    createModal(item.id, item as ModalItem);
  }, []);

  return null;
}
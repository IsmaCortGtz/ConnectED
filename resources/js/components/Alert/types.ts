import { ButtonType } from "@/components/Button";
import type { ModalItem } from "@/components/Modal";

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export interface AlertButton {
  label: string;
  type: ButtonType;
  icon?: string;
  onClick: (close: () => void) => void;
}

export interface AlertItem extends ModalItem {
  data: {
    type: AlertType;
    title: string;
    message: string;
    buttons?: AlertButton[];
  }
}

export type AlertCallback = (title: string, message: string, buttons?: AlertButton[]) => void;
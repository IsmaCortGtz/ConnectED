import { createContext } from "react";

export interface ModalItem {
  id: string;
  open: boolean;
  closeBtn: boolean;
  closeOut: boolean;
  children: React.ReactNode;
  data?: any;
  onClickOut?: (id: string) => unknown;
  onClose?: (id: string) => unknown;
  onOpen?: (id: string) => unknown;
}

export interface ModalState {
  _stack: Record<string, ModalItem>;
  _ids: string[];
  createModal: (id: string, modal: ModalItem) => void;
  deleteModal: (id: string) => void;
  setData: (id: string, data: any) => any;
  getData: (id: string) => void;
  open: (id: string, data?: any) => void;
  close: (id: string) => void;
}

export const ModalContext = createContext<ModalState>({ 
  _stack: {},
  _ids: [],
  createModal: () => {},
  deleteModal: () => {},
  setData: () => {},
  getData: () => {},
  open: () => {},
  close: () => {},
});
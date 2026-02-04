import { useContext, useState } from "react";
import { ModalContext, ModalItem } from "./context";
import { AnimatePresence, motion } from "framer-motion";
import '../modal.scss';
import { Icon } from "@/components/Icon";

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [_stack, setStack] = useState<Record<string, ModalItem>>({});
  const [_ids, setIds] = useState<string[]>([]);

  const createModal = (id: string, modal: ModalItem) => {
    setIds(old => {
      if (old.includes(id)) return old;
      return [...old, id];
    });

    setStack(old => ({
      ...old,
      [id]: modal,
    }));
  };

  const deleteModal = (id: string) => {
    setIds(old => {
      if (!old.includes(id)) return old;
      return old.filter(_id => _id !== id);
    });

    setStack(old => {
      if (!(id in old)) return old;
      const newStack = { ...old };
      delete newStack[id];
      return newStack;
    });
  };

  const setData = (id: string, data: any) => {
    setStack(old => {
      if (!(id in old)) return old;
      return {
        ...old,
        [id]: {
          ...old[id],
          data: data,
        }
      };
    });
  };

  const getData = (id: string) => {
    if (!_ids.includes(id)) return;
    return _stack[id].data;
  };

  const open = (id: string, data?: any) => {
    setStack(old => {
      if (!(id in old)) return old;
      return {
        ...old,
        [id]: {
          ...old[id],
          data: data,
          open: true,
        }
      };
    });
  };

  const close = (id: string) => {
    _stack[id]?.onClose?.(id);
    setStack(old => {
      if (!(id in old)) return old;
      return {
        ...old,
        [id]: {
          ...old[id],
          open: false,
        }
      };
    });
  };

  return (
    <ModalContext.Provider value={{ _stack, _ids, createModal, deleteModal, setData, getData, open, close }}>
      {children}
      <section className="modal-list-container-component-wrapper">
        <AnimatePresence mode="popLayout">

          {Object.values(_stack).map((modal, index) => {
            if (!modal.open) return null;
            return (
              <motion.article
                initial={{ backdropFilter: 'blur(0px) brightness(1)' }}
                animate={{ backdropFilter: 'blur(2px) brightness(0.8)' }}
                exit={{ backdropFilter: 'blur(0px) brightness(1)' }}
                transition={{ duration: 0.3, ease: 'easeIn' }}
                key={`modal-${index}`}
                className="modal-component-item-container"
                data-modal-id={modal.id}
                onClick={() => {if (modal.closeOut) close(modal.id); modal?.onClickOut?.(modal.id) }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.1, y: 40, x: '-50%' }}
                  animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                  exit={{ opacity: 0, scale: 0.1, y: 40, x: '-50%' }}
                  transition={{ duration: 0.4, ease: [0.68, -0.7, 0.32, 1.7] }}
                  className={`modal-component-item-card`}
                  data-modal-id={modal.id}
                  onClick={(e) => e.stopPropagation()}
                >
                  {modal.children}
                  {modal.closeBtn && (
                    <motion.button
                      className="modal-component-item-close-btn"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => close(modal.id)}
                    >
                      <Icon icon="close" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.article>
            );
          })}

        </AnimatePresence>
      </section>
    </ModalContext.Provider>
  );
}
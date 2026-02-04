import { Fragment, useEffect } from "react";
import { useModal } from "@/components/Modal";
import { Button } from "@/components/Button";
import type { AlertButton, AlertCallback, AlertItem, AlertType } from "./types";
import { Alert } from './Class';
import './alert.scss';

interface AlertProviderProps {
  children: React.ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const { createModal, deleteModal } = useModal();

  const renderAlertModal = (type: AlertType, id: string, title: string, message: string, buttons: AlertButton[]) => (
    <Fragment>
      <header className={`alert-header alert-${type}`}>
        <img className='alert-icon' src={`/icons/${type}.svg`} alt={type} />
        <h4 className='alert-title'>{title}</h4>
      </header>

      <p className='alert-message'>{message}</p>

      <div className='alert-buttons-container'>
        {(!buttons || buttons.length <= 0) && (
          <Button className='alert-btn' btnLevel={type} onClick={() => deleteModal(id)}>Close</Button>
        )}
        {buttons && buttons.map((btn, btnIndex) => (
          <Button
            key={`alert-btn-${btnIndex}`}
            className='alert-btn'
            btnLevel={type}
            btnType={btn.type}
            onClick={() => btn.onClick(deleteModal.bind(null, id))}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </Fragment>
  );

  const _addAlert = (type: AlertType, title: string, message: string, buttons?: AlertButton[]) => {
    const alertId = 'alert-modal-id-' + Date.now().toString() + Math.random().toString(36).slice(2);
    const newAlert: AlertItem = {
      id: alertId,
      open: true,
      closeBtn: false,
      closeOut: false,
      children: renderAlertModal(type, alertId, title, message, buttons ?? []),
      data: {
        type,
        title,
        message,
        buttons,
      },
    };

    createModal(alertId, newAlert);
  };

  const _success = (...args: Parameters<AlertCallback>) => _addAlert('success', ...args);
  const _info = (...args: Parameters<AlertCallback>) => _addAlert('info', ...args);
  const _warning = (...args: Parameters<AlertCallback>) => _addAlert('warning', ...args);
  const _error = (...args: Parameters<AlertCallback>) => _addAlert('error', ...args);

  useEffect(() => {
    Alert._success = _success;
    Alert._info = _info;
    Alert._warning = _warning;
    Alert._error = _error;

    return () => {
      Alert._success = null;
      Alert._info = null;
      Alert._warning = null;
      Alert._error = null;
    };
  }, []);

  return children;
}
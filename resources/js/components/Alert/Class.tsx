import { AlertCallback } from "./types";
import './alert.scss';

export class Alert {
  public static _success: AlertCallback | null = null;
  public static _info: AlertCallback | null = null;
  public static _warning: AlertCallback | null = null;
  public static _error: AlertCallback | null = null;

  public static success(...args: Parameters<AlertCallback>) { this?._success?.(...args) }
  public static info(...args: Parameters<AlertCallback>) { this?._info?.(...args) }
  public static warning(...args: Parameters<AlertCallback>) { this?._warning?.(...args) }
  public static error(...args: Parameters<AlertCallback>) { this?._error?.(...args) }
}
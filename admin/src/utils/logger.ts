const PREFIX = "%c[ADMIN]";
const PREFIX_STYLE = "background: #2563eb; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold;";
const ACTION_STYLE = "color: #3b82f6; font-weight: bold;";
const API_STYLE = "color: #8b5cf6; font-weight: bold;";
const SUCCESS_STYLE = "color: #10b981; font-weight: bold;";
const WARN_STYLE = "color: #f59e0b; font-weight: bold;";
const ERROR_STYLE = "color: #ef4444; font-weight: bold;";

export const logger = {
  action(actionName: string, ...args: unknown[]) {
    console.log(
      `${PREFIX} %c[ACTION] %c${actionName}`,
      PREFIX_STYLE,
      ACTION_STYLE,
      "color: inherit;",
      ...args
    );
  },

  api(opName: string, ...args: unknown[]) {
    console.log(
      `${PREFIX} %c[API] %c${opName}`,
      PREFIX_STYLE,
      API_STYLE,
      "color: inherit;",
      ...args
    );
  },

  success(message: string, ...args: unknown[]) {
    console.log(
      `${PREFIX} %c[SUCCESS] %c${message}`,
      PREFIX_STYLE,
      SUCCESS_STYLE,
      "color: inherit;",
      ...args
    );
  },

  warn(context: string, ...args: unknown[]) {
    console.warn(
      `${PREFIX} %c[WARN] %c${context}`,
      PREFIX_STYLE,
      WARN_STYLE,
      "color: inherit;",
      ...args
    );
  },

  error(context: string, error: unknown, ...args: unknown[]) {
    console.error(
      `${PREFIX} %c[ERROR] %c${context}`,
      PREFIX_STYLE,
      ERROR_STYLE,
      "color: inherit;",
      error,
      ...args
    );
  },

  info(message: string, ...args: unknown[]) {
    console.log(
      `${PREFIX} %c[INFO]`,
      PREFIX_STYLE,
      "color: #6b7280;",
      message,
      ...args
    );
  },
};

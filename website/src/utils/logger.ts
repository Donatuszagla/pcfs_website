const isBrowser = typeof window !== "undefined";

const PREFIX_STYLE = "background: #059669; color: #ffffff; padding: 2px 6px; border-radius: 3px; font-weight: bold;";
const ACTION_STYLE = "color: #10b981; font-weight: bold;";
const DATA_STYLE = "color: #06b6d4; font-weight: bold;";
const WARN_STYLE = "color: #f59e0b; font-weight: bold;";
const ERROR_STYLE = "color: #ef4444; font-weight: bold;";

export const logger = {
  action(actionName: string, ...args: unknown[]) {
    if (isBrowser) {
      console.log(
        "%c[WEBSITE] %c[ACTION] %c" + actionName,
        PREFIX_STYLE,
        ACTION_STYLE,
        "color: inherit;",
        ...args
      );
    } else {
      console.log(`[WEBSITE:ACTION] ${actionName}`, ...args);
    }
  },

  data(message: string, ...args: unknown[]) {
    if (isBrowser) {
      console.log(
        "%c[WEBSITE] %c[DATA] %c" + message,
        PREFIX_STYLE,
        DATA_STYLE,
        "color: inherit;",
        ...args
      );
    } else {
      console.log(`[WEBSITE:DATA] ${message}`, ...args);
    }
  },

  success(message: string, ...args: unknown[]) {
    if (isBrowser) {
      console.log(
        "%c[WEBSITE] %c[SUCCESS] %c" + message,
        PREFIX_STYLE,
        "color: #10b981; font-weight: bold;",
        "color: inherit;",
        ...args
      );
    } else {
      console.log(`[WEBSITE:SUCCESS] ${message}`, ...args);
    }
  },

  warn(context: string, ...args: unknown[]) {
    if (isBrowser) {
      console.warn(
        "%c[WEBSITE] %c[WARN] %c" + context,
        PREFIX_STYLE,
        WARN_STYLE,
        "color: inherit;",
        ...args
      );
    } else {
      console.warn(`[WEBSITE:WARN] ${context}`, ...args);
    }
  },

  error(context: string, error: unknown, ...args: unknown[]) {
    if (isBrowser) {
      console.error(
        "%c[WEBSITE] %c[ERROR] %c" + context,
        PREFIX_STYLE,
        ERROR_STYLE,
        "color: inherit;",
        error,
        ...args
      );
    } else {
      console.error(`[WEBSITE:ERROR] ${context}:`, error, ...args);
    }
  },

  info(message: string, ...args: unknown[]) {
    if (isBrowser) {
      console.log(
        "%c[WEBSITE] %c[INFO]",
        PREFIX_STYLE,
        "color: #6b7280;",
        message,
        ...args
      );
    } else {
      console.log(`[WEBSITE:INFO] ${message}`, ...args);
    }
  },
};

const LOG_PREFIX = "[Auth]";

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(event: string, details?: Record<string, unknown>) {
    console.log(`${timestamp()} ${LOG_PREFIX} INFO ${event}`, details ?? "");
  },

  warn(event: string, details?: Record<string, unknown>) {
    console.warn(`${timestamp()} ${LOG_PREFIX} WARN ${event}`, details ?? "");
  },

  error(event: string, details?: Record<string, unknown>) {
    console.error(`${timestamp()} ${LOG_PREFIX} ERROR ${event}`, details ?? "");
  },
};
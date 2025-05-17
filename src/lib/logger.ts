import fs from 'fs';
import path from 'path';

// Niveles de log con colores para la consola
enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  DEBUG = 'DEBUG',
}

// Mapa de colores para la consola
const LogColors = {
  [LogLevel.INFO]: '\x1b[36m', // Cyan
  [LogLevel.WARNING]: '\x1b[33m', // Amarillo
  [LogLevel.ERROR]: '\x1b[31m', // Rojo
  [LogLevel.CRITICAL]: '\x1b[41m\x1b[37m', // Rojo de fondo, texto blanco
  [LogLevel.DEBUG]: '\x1b[35m', // Magenta
  RESET: '\x1b[0m', // Reset color
};

// Configuración del logger
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// Asegurar que existe el directorio de logs
if (LOG_TO_FILE) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('No se pudo crear el directorio de logs:', error);
  }
}

/**
 * Función para generar logs en formato JSON
 */
export function formatLogObject(
  level: LogLevel,
  context: string,
  message: string,
  data?: Record<string, unknown> | null
) {
  return {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    ...(data && { data }),
  };
}

/**
 * Guarda el log en un archivo
 */
function saveToFile(logObject: ReturnType<typeof formatLogObject>) {
  if (!LOG_TO_FILE) return;

  try {
    const logEntry = JSON.stringify(logObject) + '\n';
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.error('Error al escribir en el archivo de log:', error);
  }
}

/**
 * Imprime el log en la consola con colores
 */
function printToConsole(logObject: ReturnType<typeof formatLogObject>) {
  const color = LogColors[logObject.level] || LogColors.RESET;
  const reset = LogColors.RESET;
  
  console.log(
    `${color}[${logObject.level}]${reset} ${logObject.timestamp} (${logObject.context}): ${logObject.message}`
  );
  
  if (logObject.data) {
    console.log('Datos adicionales:', logObject.data);
  }
}

/**
 * Clase principal del logger
 */
class Logger {
  /**
   * Log informativo general
   */
  info(context: string, message: string, data?: Record<string, unknown> | null) {
    const logObject = formatLogObject(LogLevel.INFO, context, message, data);
    printToConsole(logObject);
    saveToFile(logObject);
  }

  /**
   * Log de advertencia - situaciones que necesitan atención
   */
  warning(context: string, message: string, data?: Record<string, unknown> | null) {
    const logObject = formatLogObject(LogLevel.WARNING, context, message, data);
    printToConsole(logObject);
    saveToFile(logObject);
  }

  /**
   * Log de error - problemas que afectan la operación pero no la detienen
   */
  error(context: string, message: string, data?: Record<string, unknown> | null) {
    const logObject = formatLogObject(LogLevel.ERROR, context, message, data);
    printToConsole(logObject);
    saveToFile(logObject);
  }

  /**
   * Log crítico - problemas graves que pueden detener la aplicación
   */
  critical(context: string, message: string, data?: Record<string, unknown> | null) {
    const logObject = formatLogObject(LogLevel.CRITICAL, context, message, data);
    printToConsole(logObject);
    saveToFile(logObject);
  }

  /**
   * Log de depuración - solo para desarrollo
   */
  debug(context: string, message: string, data?: Record<string, unknown> | null) {
    // Solo mostrar en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const logObject = formatLogObject(LogLevel.DEBUG, context, message, data);
      printToConsole(logObject);
      saveToFile(logObject);
    }
  }

  /**
   * Log de errores con stack trace
   */
  logError(context: string, error: unknown, critical = false) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    const logMethod = critical ? this.critical.bind(this) : this.error.bind(this);
    
    logMethod(context, errorMessage, {
      stack: errorStack,
    });
  }
}

// Exportar una instancia única del logger
export const logger = new Logger();

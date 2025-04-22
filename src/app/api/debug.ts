import fs from 'fs';
import path from 'path';

// Función para guardar logs en un archivo
export function saveLog(message: string, data?: unknown) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'api.log');
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}\n`;
    
    if (data) {
      logMessage += `DATA: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`;
    }
    
    logMessage += '-----------------------------------\n';
    
    // Añadir al archivo de log
    fs.appendFileSync(logFile, logMessage);
    
    // También imprimir en consola
    console.log(message);
    if (data) {
      console.log(data);
    }
  } catch (error) {
    console.error('Error al guardar log:', error);
  }
}

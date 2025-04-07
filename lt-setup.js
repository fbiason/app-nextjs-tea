/**
 * Script para configurar un túnel con localtunnel y conectar con MercadoPago
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función para actualizar el archivo .env con la URL del túnel
function updateEnvFile(tunnelUrl) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar si APP_URL ya existe
    if (envContent.includes('APP_URL=')) {
      // Reemplazar la URL existente
      envContent = envContent.replace(/APP_URL=.*$/m, `APP_URL="${tunnelUrl}"`);
    } else {
      // Agregar la URL al final del archivo
      envContent += `\nAPP_URL="${tunnelUrl}"`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ Archivo .env actualizado con APP_URL="${tunnelUrl}"`);
  } catch (error) {
    console.error('❌ Error al actualizar el archivo .env:', error.message);
  }
}

// Función principal
console.log('🚀 Configurando túnel con localtunnel para MercadoPago...\n');

// Ejecutar localtunnel
const lt = exec('npx lt --port 3000 --subdomain tea-donaciones', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar localtunnel: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error de localtunnel: ${stderr}`);
    return;
  }
});

// Capturar la salida de localtunnel para obtener la URL
lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Buscar la URL en la salida
  const match = output.match(/(https:\/\/[a-zA-Z0-9-]+\.loca\.lt)/);
  if (match && match[1]) {
    const tunnelUrl = match[1];
    console.log(`\n🌐 URL del túnel: ${tunnelUrl}`);
    
    // Actualizar el archivo .env
    updateEnvFile(tunnelUrl);
    
    // Instrucciones para configurar el webhook en MercadoPago
    console.log('\n📋 Instrucciones para configurar el webhook en MercadoPago:');
    console.log('1. Inicia sesión en tu cuenta de MercadoPago');
    console.log('2. Ve a la sección de Desarrolladores > Webhooks');
    console.log('3. Configura un nuevo webhook con la siguiente URL:');
    console.log(`   ${tunnelUrl}/api/donations/webhook`);
    console.log('4. Selecciona los eventos "payment.created" y "payment.updated"');
    
    console.log('\n🔄 Ahora puedes iniciar tu aplicación con:');
    console.log('   npm run dev');
    
    console.log('\n⚠️ Importante: Mantén esta terminal abierta mientras desarrollas');
    console.log('   El túnel se cerrará cuando cierres esta terminal');
  }
});

// Manejar el cierre del proceso
lt.on('close', (code) => {
  console.log(`Localtunnel se ha cerrado con código: ${code}`);
});

// Mantener el proceso en ejecución
process.stdin.resume();

// Manejar la señal de interrupción (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando túnel y saliendo...');
  lt.kill();
  process.exit(0);
});

import api from "@/api";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Endpoint para obtener la URL de autorización de MercadoPago
 * Esta ruta genera una URL a la que el beneficiario debe acceder para
 * aceptar los términos y condiciones de MercadoPago y autorizar la integración
 */
export async function GET() {
  logger.info('MP_AUTHORIZE', '🔐 Generando URL de autorización de MercadoPago');
  
  try {
    // Verificamos que las variables de entorno estén configuradas
    if (!process.env.NEXT_PUBLIC_MP_CLIENT_ID) {
      logger.critical('MP_AUTHORIZE', '❌ Variable de entorno NEXT_PUBLIC_MP_CLIENT_ID no configurada');
      return NextResponse.json({ 
        success: false, 
        error: "Client ID de MercadoPago no configurado" 
      }, { status: 500 });
    }
    
    if (!process.env.APP_URL) {
      logger.critical('MP_AUTHORIZE', '❌ Variable de entorno APP_URL no configurada');
      return NextResponse.json({ 
        success: false, 
        error: "URL de la aplicación no configurada" 
      }, { status: 500 });
    }
    
    // Log de parámetros para debugging
    logger.debug('MP_AUTHORIZE', 'Parámetros de autorización', {
      client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
      redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`
    });
    
    // Obtenemos la URL de autorización de MercadoPago
    logger.info('MP_AUTHORIZE', '🔍 Solicitando URL de autorización a MercadoPago...');
    const authorizationUrl = await api.mercadopago.authorize();
    
    // Log de éxito
    logger.info('MP_AUTHORIZE', '✅ URL de autorización generada correctamente');
    logger.debug('MP_AUTHORIZE', 'URL de autorización', { url: authorizationUrl });
    
    // Devolvemos la URL de autorización
    return NextResponse.json({
      success: true,
      url: authorizationUrl
    });
  } catch (error) {
    // Log detallado del error
    logger.logError('MP_AUTHORIZE', error, true);
    
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    logger.critical('MP_AUTHORIZE', `❌ Error al obtener la URL de autorización: ${errorMessage}`);
    
    // Devolvemos un error
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

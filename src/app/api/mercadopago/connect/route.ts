import api from "@/api";
import {NextRequest, NextResponse} from "next/server";
import { logger } from "@/lib/logger";


export async function GET(request: NextRequest) {
  logger.info('MP_CONNECT', '🔗 Recibida solicitud de conexión con MercadoPago');
  
  try {
    // Obtenemos el code y el state de la request
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    
    // Verificamos que tengamos tanto el code como el state
    if (!code) {
      logger.warning('MP_CONNECT', '⚠️ No se recibió código de autorización');
      return NextResponse.redirect(`${process.env.APP_URL}/mercadopago?error=no_code`);
    }
    
    if (!state) {
      logger.warning('MP_CONNECT', '⚠️ No se recibió estado de autorización (CSRF)');
      return NextResponse.redirect(`${process.env.APP_URL}/mercadopago?error=no_state`);
    }
    
    // Log para debugging - solo mostramos parte de la información sensible por seguridad
    logger.info('MP_CONNECT', `📝 Recibido código y estado de autorización`);
    logger.debug('MP_CONNECT', 'Detalles de autorización recibidos', {
      codePreview: code.substring(0, 5) + '...',
      statePreview: state.substring(0, 8) + '...',
    });
    
    // Verificamos las variables de entorno relevantes
    logger.debug('MP_CONNECT', 'Variables de entorno relevantes', {
      APP_URL: process.env.APP_URL,
      redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`
    });
    
    // Conectamos al usuario con el code y el state, obtenemos las credenciales
    // La función connect ahora verifica automáticamente el estado OAuth
    logger.info('MP_CONNECT', '🔄 Verificando estado y solicitando tokens...');
    const credentials = await api.mercadopago.connect(code, state);
    
    if (!credentials || !credentials.access_token) {
      logger.error('MP_CONNECT', '❌ No se recibieron credenciales válidas de MercadoPago');
      return NextResponse.redirect(`${process.env.APP_URL}/mercadopago?error=invalid_credentials`);
    }
    
    // Todo el proceso se completó correctamente
    logger.info('MP_CONNECT', '💾 Token de acceso obtenido y almacenado en la base de datos');
    logger.info('MP_CONNECT', '✅ Conexión con MercadoPago completada exitosamente');
    
    // Redirigimos al usuario a la página del marketplace con éxito
    return NextResponse.redirect(`${process.env.APP_URL}/mercadopago?success=true`);
  } catch (error) {
    // Log detallado del error
    logger.logError('MP_CONNECT', error, true);
    
    // Intentamos obtener más detalles sobre el error
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.critical('MP_CONNECT', `❌ Error al conectar con MercadoPago: ${errorMessage}`);
    
    // Redirigimos con error
    return NextResponse.redirect(`${process.env.APP_URL}/mercadopago?error=${encodeURIComponent(errorMessage)}`);
  }
}

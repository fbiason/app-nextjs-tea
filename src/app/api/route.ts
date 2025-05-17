import { NextResponse } from "next/server";
// Importamos el cliente centralizado de Prisma en lugar de crear una nueva instancia
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { logger } from '@/lib/logger';

// Inicializar Prisma Client para poder registrar donaciones directamente
// Ya no necesitamos crear una nueva instancia de PrismaClient aquí

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

/**
 * Este endpoint actúa como receptor para las notificaciones de MercadoPago.
 * Captura las notificaciones enviadas a la raíz y procesa directamente la donación.
 */

// Endpoint GET para verificar que la raíz responde correctamente
export async function GET(request: Request) {
  logger.info('API_ROOT', '🔔 Solicitud GET recibida');
  
  try {
    const url = new URL(request.url);
    logger.debug('API_ROOT', 'URL completa GET', { url: request.url });
    logger.debug('API_ROOT', 'Parámetros GET', { params: Object.fromEntries(url.searchParams.entries()) });
    
    return NextResponse.json({ success: true, message: "Endpoint raíz funcionando correctamente" });
  } catch (error) {
    logger.logError('API_ROOT', error);
    return NextResponse.json({ error: "Error processing GET request" });
  }
}

// Endpoint POST para recibir notificaciones de MercadoPago
export async function POST(request: Request) {
  logger.info('API_ROOT', '🔔 Notificación POST recibida');
  logger.debug('API_ROOT', 'Headers completos', { headers: Object.fromEntries(request.headers.entries()) });
  
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    logger.debug('API_ROOT', 'Detalles de la solicitud', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      params: Object.fromEntries(searchParams.entries())
    });
    
    // Intentar obtener el body de la petición si es necesario
    let requestBody;
    try {
      const clonedRequest = request.clone();
      requestBody = await clonedRequest.text();
      
      // Intentar parsear como JSON si es posible (solo para depuración si es necesario)
      try {
        JSON.parse(requestBody);
      } catch {
        // Silenciar error si no es un JSON válido
      }
    } catch {
      // Silenciar error si no se puede obtener el body
    }
    
    // Verificamos si es una notificación de MercadoPago
    const id = searchParams.get('id') || searchParams.get('payment_id') || searchParams.get('collection_id');
    const topic = searchParams.get('topic') || 'payment'; // Asumimos 'payment' si no viene el topic
    
    logger.info('API_ROOT', `Parámetros identificados: id=${id}, topic=${topic}`);
    logger.debug('API_ROOT', 'Query params completos', { params: Object.fromEntries(searchParams.entries()) });
    
    if (id) { // Solo verificamos que haya un ID, no importa el topic
      logger.info('API_ROOT', `🔄 Procesando notificación de MercadoPago (ID: ${id})`);
      
      try {
        // Intentamos obtener el body de la petición
        let requestBody;
        try {
          requestBody = await request.json();
          logger.debug('API_ROOT', 'Body de la petición', { body: requestBody });
        } catch (bodyError) {
          logger.warning('API_ROOT', 'No se pudo obtener el body de la petición', { error: (bodyError as Error).message });
          requestBody = { data: { id }, type: "payment" };
        }
        
        // Procesamos el pago directamente aquí en lugar de redirigir
        logger.info('API_ROOT', `🔍 Obteniendo información del pago ID: ${id}`);
        
        try {
          // Obtener información del pago desde MercadoPago
          const payment = await new Payment(mercadopago).get({ id });
          logger.info('API_ROOT', '💰 Información del pago obtenida con éxito');
          logger.info('API_ROOT', `💲 Estado del pago: ${payment.status}`);
          logger.debug('API_ROOT', '📊 Metadatos del pago', { metadata: payment.metadata || {} });
          
          // Procesar el pago según su estado
          if (payment.status === "approved") {
            logger.info('API_ROOT', '✅ Pago aprobado, procesando donación...');
            
            try {
              // Intentar obtener metadatos primero (preferencia)
              let isAnonymous = false;
              let donorName = null;
              let donorEmail = null;
              let donorPhone = null;
              let frequency = "once";
              const amount = payment.transaction_amount as number;
              
              // Verificar si hay metadatos disponibles
              if (payment.metadata) {
                logger.debug('API_ROOT', '📊 Usando metadatos del pago', { metadata: payment.metadata });
                
                const metadata = payment.metadata as {
                  donor_name?: string;
                  donor_email?: string;
                  donor_phone?: string;
                  donation_type?: string;
                  anonymous?: boolean | string;
                };
                isAnonymous = metadata.anonymous === true || metadata.anonymous === 'true';
                donorName = metadata.donor_name || null;
                donorEmail = metadata.donor_email || null;
                donorPhone = metadata.donor_phone || null;
                frequency = metadata.donation_type || "once";
              } else {
                // Si no hay metadatos, intentamos obtener datos del pagador
                logger.warning('API_ROOT', '⚠️ No hay metadatos, usando datos del pagador');
                
                if (payment.payer) {
                  const payer = payment.payer as { 
                    first_name?: string; 
                    last_name?: string; 
                    email?: string;
                    identification?: { number?: string };
                    phone?: { number?: string };
                  };
                  
                  const firstName = payer.first_name || '';
                  const lastName = payer.last_name || '';
                  
                  if (firstName || lastName) {
                    donorName = `${firstName} ${lastName}`.trim();
                  }
                  
                  donorEmail = payer.email || null;
                  donorPhone = payer.phone?.number || null;
                }
              }
              
              logger.info('API_ROOT', `👤 Datos del donante: ${donorName}, ${donorEmail}, ${donorPhone}`);
              logger.info('API_ROOT', `💵 Monto: ${amount}, Frecuencia: ${frequency}`);

              // Registrar usuario si tenemos email
              let userId = null;
              if (donorEmail) {
                try {
                  // Buscar usuario existente
                  const existingUser = await prisma.user.findUnique({
                    where: { email: donorEmail }
                  });
                  
                  if (existingUser) {
                    logger.info('API_ROOT', `👤 Usuario existente encontrado: ${existingUser.id}`);
                    userId = existingUser.id;
                  } else {
                    // Crear nuevo usuario
                    const newUser = await prisma.user.create({
                      data: {
                        email: donorEmail,
                        name: donorName,
                        role: 'DONOR'
                      }
                    });
                    logger.info('API_ROOT', `👱 Nuevo usuario creado: ${newUser.id}`);
                    userId = newUser.id;
                  }
                } catch (userError) {
                  logger.logError('API_ROOT', userError);
                }
              }
              
              // Registrar la donación
              logger.info('API_ROOT', 'Intentando crear donación', {
                amount,
                anonymous: isAnonymous,
                donorName,
                donorEmail,
                phone: donorPhone,
                frequency,
                userId,
                paymentId: id
              });
              
              try {
                const donation = await prisma.donation.create({
                  data: {
                    amount,
                    anonymous: isAnonymous,
                    donorName,
                    donorEmail,
                    phone: donorPhone,
                    frequency,
                    userId,
                    paymentId: id,
                    createdAt: new Date(payment.date_approved || Date.now())
                  }
                });
                
                logger.info('API_ROOT', `✅ Donación guardada con éxito. ID: ${donation.id}`, { donation });
              } catch (createError) {
                logger.logError('API_ROOT', createError, true);
                throw createError; // Re-lanzar para que se maneje en el catch principal
              }
              
            } catch (dbError) {
              logger.logError('API_ROOT', dbError, true);
            }
          } else {
            logger.info('API_ROOT', `ℹ️ Pago no aprobado. Estado: ${payment.status}`);
          }
          
        } catch (paymentError) {
          logger.logError('API_ROOT', paymentError);
        }
        
        // Devolvemos un 200 OK para que MercadoPago sepa que recibimos la notificación
        logger.info('API_ROOT', '✅ Notificación procesada correctamente');
        return NextResponse.json({ success: true });
        
      } catch (error) {
        logger.logError('API_ROOT', error, true);
        
        // En caso de error, devolvemos un 200 para que MercadoPago no reintente
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        }, { status: 200 });
      } finally {
        await prisma.$disconnect();
      }
    }
    
    // Si no es una notificación de MercadoPago válida
    logger.warning('API_ROOT', '⚠️ No es una notificación de MercadoPago válida');
    return NextResponse.json({
      success: false,
      error: 'Notificación no válida',
    }, { status: 200 }); // Devolvemos 200 para evitar reintentos
    
  } catch (error) {
    logger.logError('API_ROOT', error, true);
    return NextResponse.json({
      success: false, 
      error: 'Error inesperado'
    }, { status: 200 });
  }
}

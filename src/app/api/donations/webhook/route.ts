import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { logger } from "@/lib/logger";
import api from "@/api";
import { verifyMercadoPagoSignature } from "@/lib/mercadopago-webhook";

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
});

export async function POST(request: Request) {
  logger.info('WEBHOOK', '🔔 Notificación recibida de MercadoPago');
  logger.debug('WEBHOOK', 'Detalles de la solicitud', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  });

  const url = new URL(request.url);
  logger.debug('WEBHOOK', 'Parámetros de consulta', { params: Object.fromEntries(url.searchParams.entries()) });

  try {
    // Clonar la request para poder acceder al cuerpo dos veces
    const clonedRequest = request.clone();
    const bodyText = await clonedRequest.text();
    
    // Obtener los parámetros de consulta de la URL
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // Verificar la firma del webhook para garantizar autenticidad
    // Pasamos los parámetros de consulta para una verificación más completa
    const isSignatureValid = verifyMercadoPagoSignature(bodyText, request.headers, queryParams);
    
    // En producción, rechazar solicitudes con firma inválida
    // En desarrollo, solo registrar advertencia
    if (!isSignatureValid) {
      if (process.env.NODE_ENV === 'production') {
        logger.error('WEBHOOK', '🚫 Firma inválida, posible solicitud fraudulenta');
        return NextResponse.json({ 
          error: 'Invalid signature', 
          message: 'La firma de la solicitud no es válida' 
        }, { status: 401 });
      } else {
        logger.warning('WEBHOOK', '⚠️ Firma inválida (ignorada en entorno de desarrollo)');
      }
    } else {
      logger.info('WEBHOOK', '✅ Firma de webhook verificada correctamente');
    }
    
    // Parsear el cuerpo de la solicitud
    const body = JSON.parse(bodyText);
    logger.debug('WEBHOOK', '📦 Datos recibidos del webhook', { body });

    // Extraer el ID de pago de los diferentes formatos de notificación que envía MercadoPago
    let paymentId = null;
    
    // Formato 1: ?data.id=X&type=payment (body.data.id existe)
    if (body.type === "payment" && body.data?.id) {
      paymentId = body.data.id;
    }
    // Formato 2: ?id=X&topic=payment (body.resource es el ID directamente)
    else if (body.topic === "payment" && body.resource) {
      paymentId = body.resource;
    }
    // Si no podemos identificar un pago, ignoramos la notificación
    else {
      logger.info('WEBHOOK', '⏩️ Notificación ignorada: no es de tipo payment o formato desconocido');
      return NextResponse.json({ success: true, message: "Notification type not handled" });
    }
    
    logger.info('WEBHOOK', `🔍 Recibida notificación para el pago ID: ${paymentId}`);

    // Verificamos si ya existe una donación con este ID de pago
    const existingDonation = await api.donations.getByPaymentId(paymentId);

    if (existingDonation) {
      logger.warning('WEBHOOK', `⚠️ Ya existe una donación con este ID de pago: ${existingDonation.id}`);
      
      // Si existe pero no tiene datos del donante y no es anónima, podemos actualizar en un paso posterior
      // Sin embargo, no creamos un duplicado
      
      // Actualizamos el estado si es necesario
      if (paymentId && existingDonation.id) {
        await api.donations.updatePaymentStatus(
          existingDonation.id,
          paymentId,
          'approved'
        );
      }
      
      logger.info('WEBHOOK', `✅ Estado de pago actualizado para la donación: ${existingDonation.id}`);
      
      return NextResponse.json({
        success: true,
        message: "Donación ya registrada, estado actualizado",
        donation: existingDonation
      });
    }

    logger.info('WEBHOOK', `🔍 Intentando obtener información del pago ID: ${paymentId}`);

    try {
      const payment = await new Payment(mercadopago).get({ id: paymentId });
      logger.info('WEBHOOK', '💰 Información del pago obtenida con éxito');
      logger.info('WEBHOOK', `💲 Estado del pago: ${payment.status}`);
      logger.debug('WEBHOOK', 'Metadatos del pago', { metadata: payment.metadata || {} });
      logger.debug('WEBHOOK', 'Detalles completos del pago', { payment });

      if (payment.status === "approved") {
        logger.info('WEBHOOK', '✅ Pago aprobado, guardando en base de datos...');
        const isAnonymous = payment.metadata?.anonymous === true || payment.metadata?.anonymous === 'true';
        const donorName = isAnonymous ? null : payment.metadata?.donor_name;
        const donorEmail = isAnonymous ? null : payment.metadata?.donor_email;
        const donorPhone = isAnonymous ? null : payment.metadata?.donor_phone;
        const frequency = payment.metadata?.donation_type === 'monthly' ? 'monthly' : 'one-time';

        const amount = payment.transaction_amount;
        if (typeof amount !== "number") {
          throw new Error("El monto de la donación no está definido en el pago recibido.");
        }

        try {
          // Verificamos de nuevo si ya existe una donación (doble verificación)
          // Utilizamos una transacción para garantizar atomicidad
          const doubleCheckDonation = await api.donations.getByPaymentId(paymentId);
          
          // Solo creamos si realmente no existe
          let donation = doubleCheckDonation;
          if (!doubleCheckDonation) {
            try {
              // Creamos la donación en nuestra base de datos usando nuestra API centralizada
              // Es crítico que proporcionemos el paymentId para evitar duplicados
              donation = await api.donations.create({
                amount,
                anonymous: isAnonymous,
                donorName,
                donorEmail,
                phone: donorPhone,
                frequency,
                paymentId: paymentId // Este campo es crucial para evitar duplicados
              });
              
              logger.info('WEBHOOK', `✅ Donación creada exitosamente con ID: ${donation.id}`);
            } catch (createError) {
              // Si ocurre un error al crear (posiblemente por una condición de carrera),
              // volvemos a intentar buscar la donación
              logger.error('WEBHOOK', 'Error al crear donación, podría ser un duplicado', { error: createError });
              donation = await api.donations.getByPaymentId(paymentId);
              
              if (!donation) {
                throw new Error('No se pudo crear la donación ni recuperar una existente');
              }
              
              logger.info('WEBHOOK', `✅ Se recuperó la donación existente: ${donation.id}`);
            }
          } else {
            logger.info('WEBHOOK', `⚠️ Se encontró una donación existente en la doble verificación: ${doubleCheckDonation.id}`);
          }

          // Actualizamos el estado de pago (solo si la donación existe)
          if (donation && donation.id) {
            await api.donations.updatePaymentStatus(
              donation.id,
              paymentId,
              'approved'
            );
          }

          if (donation && donation.id) {
            logger.info('WEBHOOK', `✅ Donación guardada con éxito. ID: ${donation.id}`, { donation });
            
            if (donorEmail) {
              logger.info('WEBHOOK', `📧 Se debe enviar un correo de confirmación a: ${donorEmail}`);
            }
          } else {
            logger.warning('WEBHOOK', `⛔ No se pudo procesar correctamente la donación`);
          }
        } catch (dbError) {
          logger.error('WEBHOOK', 'Error al guardar la donación en la base de datos', { error: dbError });
          throw dbError;
        }
      } else {
        logger.info('WEBHOOK', `ℹ️ Pago no aprobado. Estado: ${payment.status}`);
      }
    } catch (paymentError) {
      logger.logError('WEBHOOK', paymentError, true);
      throw paymentError;
    }

    logger.info('WEBHOOK', '✅ Webhook procesado correctamente');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.logError('WEBHOOK', error, true);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 200 }
    );
  }
}

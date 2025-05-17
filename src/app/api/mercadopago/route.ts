import {Payment} from "mercadopago";
import {revalidatePath} from "next/cache";
import {getMercadoPagoInstance} from "@/api";
import api from "@/api";
import {logger} from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
    const body = await request.json();
    
    // Verificamos si tenemos un ID de pago válido
    const paymentId = body.data?.id;
    
    if (!paymentId) {
      logger.error('API_MP_WEBHOOK', 'No se recibió un ID de pago válido', { body });
      return new Response(JSON.stringify({ error: 'ID de pago no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Obtenemos una instancia configurada de MercadoPago
    const mercadoPagoInstance = await getMercadoPagoInstance();
    
    // Obtenemos el pago
    const payment = await new Payment(mercadoPagoInstance).get({ id: paymentId });
    
    logger.info('API_MP_WEBHOOK', 'Notificación de pago recibida', {
      paymentId: payment.id,
      status: payment.status
    });
    
    // Verificamos si ya existe una donación con este ID de pago
    const existingDonation = await api.donations.getByPaymentId(paymentId);
    
    // Si se aprueba y no existe una donación con este ID, procesamos el pago
    if (payment.status === "approved" && !existingDonation) {
      // Aquí podríamos procesar la donación si es necesario
      // Por ejemplo, actualizar el estado de una donación existente
      logger.info('API_MP_WEBHOOK', 'Pago aprobado', { paymentId });
      
      // Revalidamos la página de inicio para mostrar los datos actualizados
      revalidatePath("/");
    }
    
    // Respondemos con un estado 200 para indicarle que la notificación fue recibida
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error('API_MP_WEBHOOK', 'Error al procesar la notificación de MercadoPago', { error });
    
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

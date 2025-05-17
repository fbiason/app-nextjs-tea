import { NextResponse } from "next/server";
import { z } from "zod";
import api from "@/api";
import { logger } from "@/lib/logger";

// Esquema condicional que valida según si es anónimo o no
const donationSchema = z.discriminatedUnion('anonymous', [
  // Si es anónimo, solo validamos monto y frecuencia
  z.object({
    anonymous: z.literal(true),
    amount: z.string().min(1, "Selecciona o ingresa un monto"),
    frequency: z.enum(["monthly", "once"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  // Si no es anónimo, validamos todos los campos excepto teléfono que es opcional
  z.object({
    anonymous: z.literal(false),
    amount: z.string().min(1, "Selecciona o ingresa un monto"),
    frequency: z.enum(["monthly", "once"]),
    firstName: z.string().min(2, "Nombre demasiado corto"),
    lastName: z.string().min(2, "Apellido demasiado corto"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Número de teléfono inválido").optional(),
  }),
]);


export async function POST(request: Request) {
  try {
    logger.info('DONATIONS', 'Recibiendo solicitud de donación');
    
    // Obtenemos los datos de la donación
    const body = await request.json();
    logger.debug('DONATIONS', 'Datos recibidos', { body });
    
    // Validamos los datos con Zod
    const validatedData = donationSchema.parse(body);
    logger.info('DONATIONS', 'Datos validados correctamente');
    
    // Convertimos el monto a número para MercadoPago
    const amount = parseFloat(validatedData.amount);
    
    // Verificamos que el token de acceso esté definido
    if (!process.env.MP_ACCESS_TOKEN) {
      logger.error('DONATIONS', 'MP_ACCESS_TOKEN no está definido');
      throw new Error('Token de acceso de MercadoPago no configurado');
    }
    
    // Preparamos los datos del usuario para la preferencia de pago
    const userData = !validatedData.anonymous ? {
      name: validatedData.firstName + ' ' + validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone
    } : {};
    
    // Creamos la preferencia de pago usando nuestra API centralizada
    const preference = await api.mercadopago.createPreference(
      amount,
      validatedData.frequency === 'monthly' ? 'monthly' : 'one-time',
      userData
    );
    
    // Ya no creamos la donación en este punto, solo almacenamos la intención
    // La donación se creará cuando MercadoPago confirme el pago a través del webhook
    // o cuando el usuario sea redirigido a la página de agradecimiento
    
    // Log para rastrear el flujo
    logger.info('DONATIONS', 'Iniciando proceso de pago, la donación se registrará tras la confirmación');
    
    // Devolvemos la URL de pago y el ID de preferencia
    logger.info('DONATIONS', 'Preferencia de pago creada exitosamente', { 
      preferenceId: preference.id 
    });
    
    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      preference_id: preference.id,
    });
  } catch (error) {
    logger.error('DONATIONS', 'Error al procesar la donación', { error });
    
    // Obtenemos más detalles del error
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    const errorDetails = error instanceof Error ? {
      name: error.name,
      stack: error.stack
    } : {};
    
    // Devolvemos un error
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      },
      { status: 400 }
    );
  }
}

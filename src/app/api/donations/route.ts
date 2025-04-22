import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";

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

// Configuración directa de MercadoPago usando el token de acceso de las variables de entorno
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
});

// Comisión de la plataforma (si aplica)
const platformCommission = process.env.MP_PLATFORM_COMMISSION 
  ? parseFloat(process.env.MP_PLATFORM_COMMISSION) 
  : 0;

export async function POST(request: Request) {
  try {
    console.log('Recibiendo solicitud de donación');
    
    // Obtenemos los datos de la donación
    const body = await request.json();
    console.log('Datos recibidos:', body);
    
    // Validamos los datos con Zod
    const validatedData = donationSchema.parse(body);
    console.log('Datos validados correctamente');
    
    // Convertimos el monto a número para MercadoPago
    const amount = parseFloat(validatedData.amount);
    
    // Creamos un título descriptivo para la donación
    const title = validatedData.frequency === "monthly" 
      ? "Donación mensual a Fundación TEA Santa Cruz" 
      : "Donación única a Fundación TEA Santa Cruz";
    
    // Verificamos que el token de acceso esté definido
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error('MP_ACCESS_TOKEN no está definido');
      throw new Error('Token de acceso de MercadoPago no configurado');
    }
    
    // Creamos la preferencia de pago directamente con MercadoPago
    const preference = await new Preference(mercadopago).create({
      body: {
        items: [
          {
            id: "donation",
            title,
            quantity: 1,
            unit_price: amount,
            currency_id: "ARS"
          }
        ],
        // Agregamos la comisión de la plataforma si está configurada
        marketplace_fee: platformCommission,
        // Solo incluimos datos del pagador si no es anónimo
        ...(!validatedData.anonymous ? {
          payer: {
            name: validatedData.firstName,
            surname: validatedData.lastName,
            email: validatedData.email,
            ...(validatedData.phone ? {
              phone: {
                number: validatedData.phone
              }
            } : {})
          }
        } : {}),
        metadata: {
          ...(!validatedData.anonymous ? {
            donor_name: `${validatedData.firstName} ${validatedData.lastName}`,
            donor_email: validatedData.email,
            donor_phone: validatedData.phone,
          } : {}),
          donation_type: validatedData.frequency,
          anonymous: validatedData.anonymous,
        },
        back_urls: {
          success: `${process.env.APP_URL}/donaciones/gracias`,
          failure: `${process.env.APP_URL}/donaciones`,
          pending: `${process.env.APP_URL}/donaciones/pendiente`,
        },
        auto_return: "approved",
        statement_descriptor: "Fundación TEA Santa Cruz",
      },
    });
    
    // Devolvemos la URL de pago y el ID de preferencia
    return NextResponse.json({
      success: true,
      init_point: preference.init_point,
      preference_id: preference.id,
    });
  } catch (error) {
    console.error("Error al procesar la donación:", error);
    
    // Obtenemos más detalles del error
    let errorMessage = "Error desconocido";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
      };
    }
    
    console.error('Detalles del error:', errorDetails);
    
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

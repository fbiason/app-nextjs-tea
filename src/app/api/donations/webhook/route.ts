import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

// Nota: Las siguientes variables están disponibles en el entorno si se necesitan en el futuro:
// - process.env.MP_PUBLIC_KEY
// - process.env.MP_CLIENT_ID
// - process.env.MP_CLIENT_SECRET

export async function POST(request: Request) {
  try {
    // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
    const body: { data: { id: string }, type: string } = await request.json();

    // Solo procesamos notificaciones de tipo 'payment'
    if (body.type !== "payment") {
      return NextResponse.json({ success: true, message: "Notification type not handled" });
    }

    // Obtenemos el pago
    const payment = await new Payment(mercadopago).get({ id: body.data.id });

    // Procesamos el pago según su estado
    if (payment.status === "approved") {
      // Aquí se puede implementar lógica adicional como:
      // - Registrar la donación en una base de datos
      // - Enviar email de agradecimiento al donante
      // - Actualizar estadísticas de donaciones
      console.log("Donación aprobada:", {
        id: payment.id,
        amount: payment.transaction_amount,
        donor: payment.metadata?.donor_name || "Anónimo",
        email: payment.metadata?.donor_email,
        type: payment.metadata?.donation_type
      });
    }

    // Respondemos con un estado 200 para indicarle a MercadoPago que la notificación fue recibida
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al procesar la notificación de pago:", error);
    
    // Devolvemos un error 500 pero con status 200 para que MercadoPago no reintente
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 200 }
    );
  }
}

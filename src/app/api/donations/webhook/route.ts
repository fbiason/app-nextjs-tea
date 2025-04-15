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
      // Guardar la donación en la base de datos
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        const isAnonymous = payment.metadata?.anonymous === true || payment.metadata?.anonymous === 'true';
        const donorName = isAnonymous ? null : payment.metadata?.donor_name;
        const donorEmail = isAnonymous ? null : payment.metadata?.donor_email;
        const donorPhone = isAnonymous ? null : payment.metadata?.donor_phone;
        
        // Si la donación es anónima, siempre debe ser de única vez
        // Si no, usamos el valor especificado o "once" por defecto
        const frequency = isAnonymous ? "once" : (payment.metadata?.frequency || "once");

        const amount = payment.transaction_amount;
        if (typeof amount !== "number") {
          throw new Error("El monto de la donación no está definido en el pago recibido.");
        }
        await prisma.donation.create({
          data: {
            amount,
            anonymous: isAnonymous,
            donorName: donorName,
            donorEmail: donorEmail,
            phone: donorPhone,
            frequency: frequency,
            createdAt: new Date(payment.date_approved || Date.now())
          }
        });
        await prisma.$disconnect();
      } catch (dbError) {
        console.error("Error guardando la donación en la base de datos:", dbError);
      }
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

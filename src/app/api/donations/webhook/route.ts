import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
// Importamos el cliente centralizado de Prisma
import { prisma } from "@/lib/prisma";
import { saveLog } from './debug';

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!
});

// Inicializar Prisma Client
// Usamos el cliente centralizado de Prisma

export async function POST(request: Request) {
  console.log('🔔 WEBHOOK: Notificación recibida de MercadoPago');
  console.log('URL completa:', request.url);
  console.log('Método:', request.method);
  console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

  const url = new URL(request.url);
  console.log('Query params:', JSON.stringify(Object.fromEntries(url.searchParams.entries()), null, 2));

  try {
    const body = await request.json();
    saveLog('📦 Datos recibidos del webhook:', body);

    if (body.type !== "payment") {
      console.log('⏭️ Notificación ignorada: no es de tipo payment');
      return NextResponse.json({ success: true, message: "Notification type not handled" });
    }

    console.log(`🔍 Recibida notificación para el pago ID: ${body.data.id}`);

    const existingDonation = await prisma.donation.findUnique({
      where: { paymentId: body.data.id }
    });

    if (existingDonation) {
      console.log(`⚠️ Ya existe una donación con este ID de pago: ${existingDonation.id}`);
      return NextResponse.json({
        success: true,
        message: "Donación ya registrada",
        donation: existingDonation
      });
    }

    console.log(`🔍 Intentando obtener información del pago ID: ${body.data.id}`);

    try {
      const payment = await new Payment(mercadopago).get({ id: body.data.id });
      console.log('💰 Información del pago obtenida con éxito');
      console.log(`💲 Estado del pago: ${payment.status}`);
      console.log('📊 Metadatos:', JSON.stringify(payment.metadata || {}, null, 2));
      console.log('Detalles completos del pago:', JSON.stringify(payment, null, 2));

      if (payment.status === "approved") {
        console.log('✅ Pago aprobado, guardando en base de datos...');
        const isAnonymous = payment.metadata?.anonymous === true || payment.metadata?.anonymous === 'true';
        const donorName = isAnonymous ? null : payment.metadata?.donor_name;
        const donorEmail = isAnonymous ? null : payment.metadata?.donor_email;
        const donorPhone = isAnonymous ? null : payment.metadata?.donor_phone;
        const frequency = isAnonymous ? "once" : (payment.metadata?.frequency || "once");

        const amount = payment.transaction_amount;
        if (typeof amount !== "number") {
          throw new Error("El monto de la donación no está definido en el pago recibido.");
        }

        let userId = null;
        if (!isAnonymous && donorEmail) {
          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: donorEmail }
            });

            if (existingUser) {
              console.log(`👤 Usuario existente encontrado: ${existingUser.id}`);
              userId = existingUser.id;
            } else {
              const newUser = await prisma.user.create({
                data: {
                  email: donorEmail,
                  name: donorName,
                  role: 'DONOR'
                }
              });
              console.log(`👱 Nuevo usuario creado: ${newUser.id}`);
              userId = newUser.id;
            }
          } catch (userError) {
            console.error('❌ Error al procesar el usuario:', userError);
          }
        }

        const donation = await prisma.donation.create({
          data: {
            amount,
            anonymous: isAnonymous,
            donorName,
            donorEmail,
            phone: donorPhone,
            frequency,
            userId,
            paymentId: body.data.id,
            createdAt: new Date(payment.date_approved || Date.now())
          }
        });

        saveLog(`✅ Donación guardada con éxito. ID: ${donation.id}`, donation);

        if (donorEmail) {
          console.log(`📧 Se debería enviar un correo de confirmación a: ${donorEmail}`);
        }
      } else {
        console.log(`ℹ️ Pago no aprobado. Estado: ${payment.status}`);
      }
    } catch (paymentError) {
      console.error('❌ Error al obtener información del pago:', paymentError);
      if (paymentError instanceof Error) {
        console.error(paymentError.stack);
      }
      throw paymentError;
    }

    console.log('✅ Webhook procesado correctamente');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error al procesar la notificación de pago:", error);
    if (error instanceof Error) {
      console.error(error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 200 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

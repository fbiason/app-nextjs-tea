import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { PrismaClient } from "@prisma/client";

// Configuración de MercadoPago
const mercadopago = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

// Inicializar Prisma Client
const prisma = new PrismaClient();

// Nota: Las siguientes variables están disponibles en el entorno si se necesitan en el futuro:
// - process.env.MP_PUBLIC_KEY
// - process.env.MP_CLIENT_ID
// - process.env.MP_CLIENT_SECRET

export async function POST(request: Request) {
  console.log('🔔 Webhook recibido de MercadoPago');
  console.log('URL completa:', request.url);
  console.log('Método:', request.method);
  console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  try {
    // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
    const body = await request.json();
    console.log('📦 Datos recibidos del webhook:', JSON.stringify(body, null, 2));

    // Solo procesamos notificaciones de tipo 'payment'
    if (body.type !== "payment") {
      console.log('⏭️ Notificación ignorada: no es de tipo payment');
      return NextResponse.json({ success: true, message: "Notification type not handled" });
    }

    console.log(`🔍 Obteniendo información del pago ID: ${body.data.id}`);
    
    // Obtenemos el pago
    try {
      console.log(`🔍 Intentando obtener información del pago ID: ${body.data.id}`);
      const payment = await new Payment(mercadopago).get({ id: body.data.id });
      console.log('💰 Información del pago obtenida con éxito');
      console.log(`💲 Estado del pago: ${payment.status}`);
      console.log(`📊 Metadatos: ${JSON.stringify(payment.metadata || {}, null, 2)}`);
      
      // Imprimir toda la información del pago para depuración
      console.log('Detalles completos del pago:', JSON.stringify(payment, null, 2));

    // Procesamos el pago según su estado
    if (payment.status === "approved") {
      console.log('✅ Pago aprobado, guardando en base de datos...');
      
      // Guardar la donación en la base de datos
      try {
        // Verificar si los metadatos están presentes
        if (!payment.metadata) {
          console.log('⚠️ No se encontraron metadatos en el pago. Usando datos del pago directamente.');
          
          // Intentar extraer información del pago directamente
          const isAnonymous = false; // Por defecto, no es anónimo si no hay metadatos
          
          // Acceder a las propiedades del pagador de forma segura
          // Imprimir el objeto payer completo para depuración
          console.log('Objeto payer completo:', JSON.stringify(payment.payer || {}, null, 2));
          
          // Extraer el nombre del pagador de forma segura
          let donorName = null;
          if (payment.payer) {
            // Obtener el nombre y apellido del pagador si están disponibles
            // Usamos type assertion para evitar errores de tipo
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
          }
          
          const donorEmail = payment.payer?.email || null;
          const donorPhone = payment.payer?.phone?.number || null;
          const frequency = "once"; // Por defecto, donación única si no hay metadatos
          
          console.log(`👤 Datos del donante (del pago): ${donorName}, ${donorEmail}, ${donorPhone}`);
          console.log(`🔄 Frecuencia de la donación (por defecto): ${frequency}`);
          
          const amount = payment.transaction_amount;
          console.log(`💵 Monto de la donación: ${amount}`);
          
          if (typeof amount !== "number") {
            throw new Error("El monto de la donación no está definido en el pago recibido.");
          }
          
          // Si no es anónimo y tenemos email, buscamos o creamos un usuario
          let userId = null;
          if (!isAnonymous && donorEmail) {
            try {
              // Buscamos si ya existe un usuario con este email
              const existingUser = await prisma.user.findUnique({
                where: { email: donorEmail }
              });
              
              if (existingUser) {
                console.log(`👤 Usuario existente encontrado: ${existingUser.id}`);
                userId = existingUser.id;
              } else {
                // Creamos un nuevo usuario
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
              // No bloqueamos la creación de la donación si falla la creación del usuario
            }
          }
          
          // Crear la donación con los datos disponibles
          const donation = await prisma.donation.create({
            data: {
              amount,
              anonymous: isAnonymous,
              donorName,
              donorEmail,
              phone: donorPhone,
              frequency,
              userId,
              paymentId: body.data.id, // Guardar el ID del pago
              createdAt: new Date(payment.date_approved || Date.now())
            }
          });
          
          console.log(`✅ Donación guardada con éxito (sin metadatos). ID: ${donation.id}`);
          
          // Si tenemos email, enviamos un correo de confirmación
          if (donorEmail) {
            // Aquí iría el código para enviar el correo
            console.log(`📧 Se debería enviar un correo de confirmación a: ${donorEmail}`);
          }
          
        } else {
          // Procesar con metadatos como antes
          const isAnonymous = payment.metadata?.anonymous === true || payment.metadata?.anonymous === 'true';
          console.log(`🔒 Donación anónima: ${isAnonymous}`);
          
          const donorName = isAnonymous ? null : payment.metadata?.donor_name;
          const donorEmail = isAnonymous ? null : payment.metadata?.donor_email;
          const donorPhone = isAnonymous ? null : payment.metadata?.donor_phone;
          
          console.log(`👤 Datos del donante: ${donorName}, ${donorEmail}, ${donorPhone}`);
          
          // Si la donación es anónima, siempre debe ser de única vez
          // Si no, usamos el valor especificado o "once" por defecto
          const frequency = isAnonymous ? "once" : (payment.metadata?.frequency || "once");
          console.log(`🔄 Frecuencia de la donación: ${frequency}`);

          const amount = payment.transaction_amount;
          console.log(`💵 Monto de la donación: ${amount}`);
          
          if (typeof amount !== "number") {
            throw new Error("El monto de la donación no está definido en el pago recibido.");
          }
          // Si no es anónimo y tenemos email, buscamos o creamos un usuario
          let userId = null;
          if (!isAnonymous && donorEmail) {
            try {
              // Buscamos si ya existe un usuario con este email
              const existingUser = await prisma.user.findUnique({
                where: { email: donorEmail }
              });
              
              if (existingUser) {
                console.log(`👤 Usuario existente encontrado: ${existingUser.id}`);
                userId = existingUser.id;
              } else {
                // Creamos un nuevo usuario
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
              // No bloqueamos la creación de la donación si falla la creación del usuario
            }
          }
          
          // Crear la donación en la base de datos
          const donation = await prisma.donation.create({
            data: {
              amount,
              anonymous: isAnonymous,
              donorName: donorName,
              donorEmail: donorEmail,
              phone: donorPhone,
              frequency: frequency,
              userId,
              paymentId: body.data.id, // Guardar el ID del pago
              createdAt: new Date(payment.date_approved || Date.now())
            }
          });
          
          console.log(`✅ Donación guardada con éxito. ID: ${donation.id}`);
          
          // Si tenemos email, enviamos un correo de confirmación
          if (donorEmail) {
            // Aquí iría el código para enviar el correo
            console.log(`📧 Se debería enviar un correo de confirmación a: ${donorEmail}`);
          }
        }
        
      } catch (dbError) {
        console.error("❌ Error guardando la donación en la base de datos:", dbError);
        // Imprimir el stack trace completo para mejor depuración
        if (dbError instanceof Error) {
          console.error(dbError.stack);
        }
      } finally {
        await prisma.$disconnect();
      }
    } else {
      console.log(`ℹ️ Pago no aprobado. Estado: ${payment.status}`);
    }
    } catch (paymentError) {
      console.error('❌ Error al obtener información del pago:', paymentError);
      if (paymentError instanceof Error) {
        console.error(paymentError.stack);
      }
      throw paymentError; // Re-lanzar para que se maneje en el catch principal
    }

    // Respondemos con un estado 200 para indicarle a MercadoPago que la notificación fue recibida
    console.log('✅ Webhook procesado correctamente');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error al procesar la notificación de pago:", error);
    
    // Imprimir el stack trace completo para mejor depuración
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    // Devolvemos un error 500 pero con status 200 para que MercadoPago no reintente
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 200 }
    );
  } finally {
    // Asegurarnos de que Prisma se desconecte correctamente
    await prisma.$disconnect();
  }
}

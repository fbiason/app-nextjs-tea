import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Inicializar Prisma Client para poder registrar donaciones directamente
const prisma = new PrismaClient();

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
  console.log('🔔 RAIZ GET: Solicitud recibida');
  
  try {
    const url = new URL(request.url);
    console.log('URL completa GET:', request.url);
    console.log('Parámetros GET:', JSON.stringify(Object.fromEntries(url.searchParams.entries())));
    
    return NextResponse.json({ success: true, message: "Endpoint raíz funcionando correctamente" });
  } catch (error) {
    console.error('Error en GET:', error);
    return NextResponse.json({ error: "Error processing GET request" });
  }
}

// Endpoint POST para recibir notificaciones de MercadoPago
export async function POST(request: Request) {
  console.log('🔔 RAIZ POST: Notificación recibida');
  console.log('Headers completos:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    console.log('URL completa:', request.url);
    console.log('Método:', request.method);
    console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
    
    // Verificamos si es una notificación de MercadoPago
    const id = searchParams.get('id');
    const topic = searchParams.get('topic');
    
    console.log(`Parámetros: id=${id}, topic=${topic}`);
    
    if (id && topic === 'payment') {
      console.log(`🔄 RAIZ: Procesando notificación de MercadoPago (ID: ${id})`);
      
      try {
        // Intentamos obtener el body de la petición
        let requestBody;
        try {
          requestBody = await request.json();
          console.log('📦 RAIZ: Body de la petición:', JSON.stringify(requestBody, null, 2));
        } catch (bodyError) {
          console.log('⚠️ RAIZ: No se pudo obtener el body de la petición:', (bodyError as Error).message);
          requestBody = { data: { id }, type: "payment" };
        }
        
        // Procesamos el pago directamente aquí en lugar de redirigir
        console.log(`🔍 RAIZ: Obteniendo información del pago ID: ${id}`);
        
        try {
          // Obtener información del pago desde MercadoPago
          const payment = await new Payment(mercadopago).get({ id });
          console.log('💰 RAIZ: Información del pago obtenida con éxito');
          console.log(`💲 RAIZ: Estado del pago: ${payment.status}`);
          
          // Procesar el pago según su estado
          if (payment.status === "approved") {
            console.log('✅ RAIZ: Pago aprobado, guardando en base de datos...');
            
            try {
              // Extraer datos del pagador
              const payer = payment.payer as { 
                first_name?: string; 
                last_name?: string; 
                email?: string;
                identification?: { number?: string };
                phone?: { number?: string };
              };
              
              const donorName = payer.first_name && payer.last_name ? 
                `${payer.first_name} ${payer.last_name}`.trim() : null;
              const donorEmail = payer.email || null;
              const donorPhone = payer.phone?.number || null;
              const isAnonymous = false; // Por defecto, asumimos que no es anónimo
              const amount = payment.transaction_amount as number;
              const frequency = "once"; // Por defecto, donación única
              
              console.log(`👤 RAIZ: Datos del donante: ${donorName}, ${donorEmail}, ${donorPhone}`);
              console.log(`💵 RAIZ: Monto: ${amount}, Frecuencia: ${frequency}`);

              // Registrar usuario si tenemos email
              let userId = null;
              if (donorEmail) {
                try {
                  // Buscar usuario existente
                  const existingUser = await prisma.user.findUnique({
                    where: { email: donorEmail }
                  });
                  
                  if (existingUser) {
                    console.log(`👤 RAIZ: Usuario existente encontrado: ${existingUser.id}`);
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
                    console.log(`👱 RAIZ: Nuevo usuario creado: ${newUser.id}`);
                    userId = newUser.id;
                  }
                } catch (userError) {
                  console.error('❌ RAIZ: Error al procesar el usuario:', userError);
                }
              }
              
              // Registrar la donación
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
              
              console.log(`✅ RAIZ: Donación guardada con éxito. ID: ${donation.id}`);
              
            } catch (dbError) {
              console.error('❌ RAIZ: Error guardando la donación:', dbError);
            }
          } else {
            console.log(`ℹ️ RAIZ: Pago no aprobado. Estado: ${payment.status}`);
          }
          
        } catch (paymentError) {
          console.error('❌ RAIZ: Error al obtener información del pago:', paymentError);
        }
        
        // Devolvemos un 200 OK para que MercadoPago sepa que recibimos la notificación
        return NextResponse.json({ success: true });
        
      } catch (error) {
        console.error('❌ RAIZ: Error general al procesar notificación:', error);
        
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
    console.log('⚠️ RAIZ: No es una notificación de MercadoPago válida');
    return NextResponse.json({
      success: false,
      error: 'Notificación no válida',
    }, { status: 200 }); // Devolvemos 200 para evitar reintentos
    
  } catch (error) {
    console.error('❌ RAIZ: Error inesperado:', error);
    return NextResponse.json({
      success: false, 
      error: 'Error inesperado'
    }, { status: 200 });
  }
}

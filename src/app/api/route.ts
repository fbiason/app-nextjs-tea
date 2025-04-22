import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { saveLog } from './debug';

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
    console.log('Query params completos:', JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2));
    
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
    
    console.log(`Parámetros identificados: id=${id}, topic=${topic}`);
    console.log('Query params completos:', JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2));
    
    if (id) { // Solo verificamos que haya un ID, no importa el topic
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
          console.log('Detalles completos del pago:', JSON.stringify(payment, null, 2));
          console.log('Metadatos:', JSON.stringify(payment.metadata || {}, null, 2));
          
          // Procesar el pago según su estado
          if (payment.status === "approved") {
            console.log('✅ RAIZ: Pago aprobado, guardando en base de datos...');
            
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
                console.log('📊 RAIZ: Usando metadatos del pago:', JSON.stringify(payment.metadata, null, 2));
                
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
                console.log('⚠️ RAIZ: No hay metadatos, usando datos del pagador');
                
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
              saveLog('RAIZ: Intentando crear donación con los siguientes datos:', {
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
                
                saveLog(`✅ RAIZ: Donación guardada con éxito. ID: ${donation.id}`, donation);
              } catch (createError) {
                saveLog('❌ RAIZ: Error al crear la donación:', createError);
                if (createError instanceof Error) {
                  saveLog('Stack trace:', createError.stack);
                }
                throw createError; // Re-lanzar para que se maneje en el catch principal
              }
              
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

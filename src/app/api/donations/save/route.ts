import { NextResponse } from "next/server";
// Importamos el cliente centralizado de Prisma
import { prisma } from "@/lib/prisma";
import { sendDonationNotificationToAdmins, sendThankYouEmailToDonor } from "@/services/email";

// Eliminada la creación de una nueva instancia de Prisma

/**
 * Endpoint para guardar donaciones directamente desde el frontend
 * después de que MercadoPago confirma el pago.
 */
export async function POST(request: Request) {
  try {
    // Obtenemos los datos de la donación
    const data = await request.json();
    console.log('Datos recibidos en /api/donations/save:', data);
    
    // Verificamos que tengamos los datos mínimos necesarios
    if (!data.amount || !data.paymentId) {
      console.error('Error: Faltan datos obligatorios', { amount: data.amount, paymentId: data.paymentId });
      return NextResponse.json({
        success: false,
        error: "Faltan datos obligatorios (amount o paymentId)"
      }, { status: 400 });
    }
    
    // Verificamos si ya existe una donación con este ID de pago
    console.log('Verificando si existe donación con paymentId:', data.paymentId);
    const existingDonation = await prisma.donation.findUnique({
      where: { paymentId: data.paymentId }
    });
    
    if (existingDonation) {
      console.log('Donación ya registrada:', existingDonation);
      return NextResponse.json({
        success: true,
        message: "Donación ya registrada",
        donation: existingDonation
      });
    }
    
    // Procesamos el usuario si tenemos email
    let userId = null;
    if (data.email && !data.anonymous) {
      try {
        console.log('Procesando usuario con email:', data.email);
        // Buscamos si ya existe un usuario con este email
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });
        
        if (existingUser) {
          console.log('Usuario existente encontrado:', existingUser.id);
          userId = existingUser.id;
        } else {
          console.log('Creando nuevo usuario');
          // Creamos un nuevo usuario
          const newUser = await prisma.user.create({
            data: {
              email: data.email,
              name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              role: 'DONOR'
            }
          });
          userId = newUser.id;
          console.log('Nuevo usuario creado:', userId);
        }
      } catch (userError) {
        console.error('Error al procesar usuario:', userError);
        // No bloqueamos la creación de la donación si falla la creación del usuario
      }
    }
    
    // Creamos la donación
    console.log('Creando donación con datos:', {
      amount: parseFloat(data.amount),
      anonymous: data.anonymous || false,
      donorName: data.anonymous ? null : (data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()),
      frequency: data.frequency || "once",
      paymentId: data.paymentId
    });
    
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(data.amount),
        anonymous: data.anonymous || false,
        donorName: data.anonymous ? null : (data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()),
        donorEmail: data.anonymous ? null : data.email,
        phone: data.anonymous ? null : data.phone,
        frequency: data.frequency || "once",
        userId,
        paymentId: data.paymentId,
        createdAt: new Date()
      }
    });
    
    console.log('Donación creada exitosamente:', donation.id);
    
    // Enviar correo electrónico a los administradores
    try {
      console.log('Enviando notificación por correo a administradores');
      await sendDonationNotificationToAdmins(donation);
      console.log('Notificación enviada a administradores');
    } catch (emailError) {
      console.error('Error al enviar notificación por correo:', emailError);
      // No bloqueamos la respuesta exitosa si falla el envío de correo
    }
    
    // Enviar correo de agradecimiento al donante si no es anónimo
    if (!data.anonymous && data.email) {
      try {
        console.log('Enviando correo de agradecimiento al donante:', data.email);
        await sendThankYouEmailToDonor(donation);
        console.log('Correo de agradecimiento enviado');
      } catch (emailError) {
        console.error('Error al enviar correo de agradecimiento:', emailError);
        // No bloqueamos la respuesta exitosa si falla el envío de correo
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Donación guardada correctamente",
      donation
    });
  } catch (error) {
    let errorMessage = "Error desconocido";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error('Error al procesar donación:', error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

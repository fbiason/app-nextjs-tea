import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendDonationNotificationToAdmins } from "@/services/email";

const prisma = new PrismaClient();

/**
 * Endpoint para guardar donaciones directamente desde el frontend
 * después de que MercadoPago confirma el pago.
 */
export async function POST(request: Request) {
  try {
    // Obtenemos los datos de la donación
    const data = await request.json();
    
    // Verificamos que tengamos los datos mínimos necesarios
    if (!data.amount || !data.paymentId) {
      return NextResponse.json({
        success: false,
        error: "Faltan datos obligatorios (amount o paymentId)"
      }, { status: 400 });
    }
    
    // Verificamos si ya existe una donación con este ID de pago
    const existingDonation = await prisma.donation.findUnique({
      where: { paymentId: data.paymentId }
    });
    
    if (existingDonation) {
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
        // Buscamos si ya existe un usuario con este email
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email }
        });
        
        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Creamos un nuevo usuario
          const newUser = await prisma.user.create({
            data: {
              email: data.email,
              name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
              role: 'DONOR'
            }
          });
          userId = newUser.id;
        }
      } catch {
        // No bloqueamos la creación de la donación si falla la creación del usuario
      }
    }
    
    // Creamos la donación
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
    
    // Enviar correo electrónico a los administradores
    try {
      await sendDonationNotificationToAdmins(donation);
    } catch (emailError) {
      console.error('Error al enviar notificación por correo:', emailError);
      // No bloqueamos la respuesta exitosa si falla el envío de correo
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
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

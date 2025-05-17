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
      
      // Si la donación existe pero faltan datos del donante, los actualizamos
      if ((!existingDonation.donorName || !existingDonation.donorEmail || !existingDonation.phone || !existingDonation.userId) && !data.anonymous) {
        console.log('Actualizando datos de donante faltantes');
        
        const donorName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
        
        // Procesamos el usuario si tenemos email
        let userId = existingDonation.userId;
        if (data.email && !userId) {
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
              console.log('Creando nuevo usuario para donación existente');
              // Creamos un nuevo usuario
              const newUser = await prisma.user.create({
                data: {
                  email: data.email,
                  name: donorName,
                  role: 'DONOR'
                }
              });
              userId = newUser.id;
              console.log('Nuevo usuario creado:', userId);
            }
          } catch (userError) {
            console.error('Error al procesar usuario:', userError);
            // No bloqueamos la actualización de la donación si falla la creación del usuario
          }
        }
        
        const updatedDonation = await prisma.donation.update({
          where: { id: existingDonation.id },
          data: {
            donorName: donorName || existingDonation.donorName,
            donorEmail: data.email || existingDonation.donorEmail,
            phone: data.phone || existingDonation.phone,
            userId: userId || existingDonation.userId
          }
        });
        
        console.log('Donación actualizada con datos del donante:', updatedDonation);
        
        // Enviar correo electrónico ahora que tenemos los datos completos
        try {
          console.log('Enviando notificación por correo a administradores');
          await sendDonationNotificationToAdmins(updatedDonation);
          console.log('Notificación enviada a administradores');
          
          if (data.email) {
            console.log('Enviando correo de agradecimiento al donante:', data.email);
            await sendThankYouEmailToDonor(updatedDonation);
            console.log('Correo de agradecimiento enviado');
          }
        } catch (emailError) {
          console.error('Error al enviar notificaciones por correo:', emailError);
        }
        
        return NextResponse.json({
          success: true,
          message: "Donación actualizada con información del donante",
          donation: updatedDonation
        });
      }
      
      // Si la donación ya tiene todos los datos o es anónima, simplemente devolvemos la existente
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
    
    // Verificamos una última vez si ya existe la donación
    // Esto evita condiciones de carrera donde podría haberse creado 
    // entre nuestra verificación inicial y ahora
    const finalCheckDonation = await prisma.donation.findUnique({
      where: { paymentId: data.paymentId }
    });
    
    let donation;
    if (finalCheckDonation) {
      console.log('Verificación final: Donación ya existe, actualizando datos:', finalCheckDonation.id);
      
      // Actualizamos los datos del donante si no están completos
      donation = await prisma.donation.update({
        where: { id: finalCheckDonation.id },
        data: {
          donorName: (!finalCheckDonation.donorName && !data.anonymous) ? 
            (data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()) : undefined,
          donorEmail: (!finalCheckDonation.donorEmail && !data.anonymous) ? data.email : undefined,
          phone: (!finalCheckDonation.phone && !data.anonymous) ? data.phone : undefined,
          userId: !finalCheckDonation.userId ? userId : undefined
        }
      });
      
      console.log('Donación actualizada con datos adicionales:', donation.id);
    } else {
      // Si realmente no existe, creamos la donación
      console.log('Verificación final: Creando donación con datos:', {
        amount: parseFloat(data.amount),
        anonymous: data.anonymous || false,
        donorName: data.anonymous ? null : (data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()),
        frequency: data.frequency || "once",
        paymentId: data.paymentId
      });
      
      donation = await prisma.donation.create({
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
    }
    
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

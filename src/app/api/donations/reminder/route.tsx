import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailReminderTemplate } from "@/components/EmailReminderTemplate";
// Importamos el cliente centralizado de Prisma
import { prisma } from "@/lib/prisma";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);
// Usamos el cliente centralizado de Prisma

// Ejecutar este endpoint con un cron diario
export async function POST() {
  try {
    // Buscar donaciones mensuales aprobadas que tengan 30 días o más desde su creación y no sean anónimas
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const donations = await prisma.donation.findMany({
      where: {
        frequency: "monthly",
        anonymous: false,
        createdAt: {
          lte: thirtyDaysAgo
        }
      },
      select: {
        donorEmail: true,
        donorName: true,
        id: true
      }
    });

    // Enviar recordatorio a cada donante
    // Definir un tipo más específico para el error de Resend
    type ResendError = {
      name?: string;
      message?: string;
      statusCode?: number;
    };
    
    const results: Array<{email: string, status: string, error?: ResendError | null}> = [];
    for (const donation of donations) {
      if (!donation.donorEmail || !donation.donorName) continue;
      const firstName = donation.donorName.split(" ")[0];
      const donationUrl = `${process.env.APP_URL}/donaciones`;
      
      const { error } = await resend.emails.send({
        from: 'Fundación TEA Santa Cruz <fund.teasantacruz@gmail.com>',
        to: [donation.donorEmail],
        subject: '¡Gracias por tu apoyo! ¿Te gustaría donar nuevamente?',
        react: React.createElement(EmailReminderTemplate, { firstName, donationUrl }),
      });
      
      results.push({ 
        email: donation.donorEmail, 
        status: error ? 'error' : 'sent', 
        error 
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Error enviando recordatorios:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  } finally {
    await prisma.$disconnect();
  }
}

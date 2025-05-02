import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Verificando donaciones en la base de datos...');
    
    // Contar el total de donaciones
    const count = await prisma.donation.count();
    console.log(`Total de donaciones encontradas: ${count}`);
    
    // Obtener las últimas 10 donaciones
    const donations = await prisma.donation.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true // Incluir información del usuario si existe
      }
    });
    
    console.log('Donaciones encontradas:', JSON.stringify(donations, null, 2));

    // Verificar la estructura de la tabla Donation
    const donationSchema = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Donation'
    `;
    console.log('Esquema de la tabla Donation:', donationSchema);

    return NextResponse.json({
      success: true,
      count,
      donations,
      schema: donationSchema
    });
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

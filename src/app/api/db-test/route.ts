import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Endpoint para probar la conexión a la base de datos
export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    // Intentar una consulta simple
    const donationCount = await prisma.donation.count();
    
    // Verificar el esquema de la tabla Donation
    const donationTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Donation'
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: "Conexión exitosa a la base de datos",
      donationCount,
      schema: donationTableInfo
    });
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

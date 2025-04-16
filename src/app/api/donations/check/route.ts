import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    // Contar el total de donaciones
    const count = await prisma.donation.count();

    return NextResponse.json({
      success: true,
      count,
      donations
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

import { NextResponse } from "next/server";
import api from "@/api";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// Función auxiliar para obtener la estructura de una tabla usando Prisma
async function getTableStructure(tableName: string) {
  try {
    let result = null;
    
    // Intentamos obtener un registro para ver la estructura
    if (tableName === 'Donation') {
      // Intentamos obtener la primera donación
      const donation = await prisma.donation.findFirst();
      if (donation) {
        result = Object.keys(donation);
      }
    } else if (tableName === 'User') {
      // Intentamos obtener el primer usuario
      const user = await prisma.user.findFirst();
      if (user) {
        result = Object.keys(user);
      }
    }
    
    // Si no hay datos, devolvemos la estructura obtenida del modelo de Prisma
    if (!result) {
      // Estructura basada en el modelo de Prisma
      if (tableName === 'Donation') {
        result = ['id', 'amount', 'anonymous', 'donorName', 'donorEmail', 'phone', 'userId', 'frequency', 'paymentId', 'createdAt'];
      } else if (tableName === 'User') {
        result = ['id', 'email', 'name', 'role', 'createdAt'];
      }
    }
    
    return result || [];
  } catch (error) {
    logger.info('DONATIONS_CHECK', `Error al obtener estructura de ${tableName}`, { error });
    return [];
  }
}

export async function GET() {
  try {
    logger.info('DONATIONS_CHECK', 'Verificando donaciones en la base de datos...');
    
    // Obtener todas las donaciones usando nuestra API centralizada
    const donations = await api.donations.list();
    
    logger.info('DONATIONS_CHECK', `Total de donaciones encontradas: ${donations.length}`);
    logger.debug('DONATIONS_CHECK', 'Donaciones encontradas', { donations });

    // Obtener información sobre la estructura de las tablas
    const donationStructure = await getTableStructure('Donation');
    const userStructure = await getTableStructure('User');
    
    return NextResponse.json({
      success: true,
      count: donations.length,
      donations: donations.slice(0, 10), // Limitamos a 10 para la respuesta
      schema: {
        Donation: donationStructure,
        User: userStructure
      }
    });
  } catch (error) {
    logger.error('DONATIONS_CHECK', 'Error al obtener donaciones', { error });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}

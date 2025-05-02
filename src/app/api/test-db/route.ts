import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Endpoint GET para probar la inserción de datos en la base de datos
export async function GET() {
  try {
    console.log('🧪 Iniciando prueba de base de datos...');
    
    // Crear un usuario de prueba
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Usuario de Prueba",
        role: "DONOR"
      }
    });
    
    console.log(`👤 Usuario de prueba creado con ID: ${user.id}`);
    
    // Crear una donación de prueba
    const donation = await prisma.donation.create({
      data: {
        amount: 100,
        anonymous: false,
        donorName: "Usuario de Prueba",
        donorEmail: "test@example.com",
        phone: "123456789",
        frequency: "once",
        userId: user.id,
        paymentId: `test-${Date.now()}`, // ID único para evitar duplicados
        createdAt: new Date()
      }
    });
    
    console.log(`💰 Donación de prueba creada con ID: ${donation.id}`);
    
    // Contar el número de donaciones en la base de datos
    const donationCount = await prisma.donation.count();
    
    return NextResponse.json({
      success: true,
      message: "Datos de prueba insertados correctamente",
      user,
      donation,
      donationCount
    });
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    
    // Obtener más detalles del error
    let errorMessage = "Error desconocido";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack
      };
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

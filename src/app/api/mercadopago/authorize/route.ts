import api from "@/api";
import { NextResponse } from "next/server";

/**
 * Endpoint para obtener la URL de autorización de MercadoPago
 * Esta ruta genera una URL a la que el beneficiario debe acceder para
 * aceptar los términos y condiciones de MercadoPago y autorizar la integración
 */
export async function GET() {
  try {
    // Obtenemos la URL de autorización de MercadoPago
    const authorizationUrl = await api.user.authorize();
    
    // Devolvemos la URL de autorización
    return NextResponse.json({
      success: true,
      url: authorizationUrl
    });
  } catch (error) {
    console.error("Error al obtener la URL de autorización:", error);
    
    // Devolvemos un error
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}

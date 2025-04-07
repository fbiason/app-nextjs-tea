import api from "@/api";
import { NextResponse } from "next/server";

/**
 * Endpoint para verificar el estado de la conexión con MercadoPago
 * Comprueba si el usuario ya tiene un token de acceso de marketplace configurado
 */
export async function GET() {
  try {
    // Obtenemos los datos del usuario
    const user = await api.user.fetch();
    
    // Verificamos si tiene un token de marketplace configurado
    const connected = !!user.marketplace;
    
    // Devolvemos el estado de la conexión
    return NextResponse.json({
      success: true,
      connected,
      // Si está conectado, podemos devolver información adicional
      ...(connected && { 
        marketplace_token_exists: true,
        // No devolvemos el token real por seguridad
      })
    });
  } catch (error) {
    console.error("Error al verificar el estado de la conexión:", error);
    
    // Devolvemos un error
    return NextResponse.json(
      { 
        success: false, 
        connected: false,
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Este middleware se ejecuta en todas las solicitudes
export async function middleware(request: NextRequest) {
  // Solo aplicamos el middleware a la ruta /mercadopago
  if (request.nextUrl.pathname === '/mercadopago') {
    try {
      // Utilizamos la API para verificar el estado de la conexión
      // Nota: Este enfoque no funcionará en el middleware de Next.js porque
      // no podemos hacer fetch a nuestras propias APIs desde el middleware
      // Por lo tanto, esta lógica debe implementarse en el componente de la página
      // Este middleware se deja como ejemplo pero no realizará la redirección
      
      // Permitimos el acceso a la página y la lógica de redirección
      // se manejará en el componente client-side
      return NextResponse.next();
    } catch (error) {
      console.error('Error en middleware:', error);
      // En caso de error, permitimos el acceso a la página
      return NextResponse.next();
    }
  }
  
  // Para todas las demás rutas, permitimos el acceso
  return NextResponse.next();
}

// Configuramos el middleware para que solo se ejecute en las rutas especificadas
export const config = {
  matcher: ['/mercadopago'],
};

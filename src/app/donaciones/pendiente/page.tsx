'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PendientePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <Clock className="h-20 w-20 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#165a91] mb-4">
          Tu donación está en proceso
        </h1>
        
        <p className="text-xl text-gray-700 mb-6">
          Gracias por tu intención de apoyar a Fundación TEA Santa Cruz.
        </p>
        
        <p className="text-lg text-gray-600 mb-8">
          Tu donación está siendo procesada. Esto puede tomar unos minutos.
          No es necesario que permanezcas en esta página, te notificaremos cuando se complete.
        </p>
        
        <div className="bg-yellow-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-[#165a91] mb-3">
            ¿Qué sucede ahora?
          </h2>
          <ul className="text-left text-gray-700 space-y-2">
            <li>• Tu pago está siendo procesado por MercadoPago</li>
            <li>• Una vez completado, recibirás una confirmación</li>
            <li>• Si tienes alguna pregunta, puedes contactarnos</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            href="/contacto"
            className="px-6 py-3 bg-[#f6bb3f] text-white font-semibold rounded-md hover:bg-[#e17a2d] transition-colors"
          >
            Contactarnos
          </Link>
          
          <Link 
            href="/"
            className="px-6 py-3 bg-[#165a91] text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

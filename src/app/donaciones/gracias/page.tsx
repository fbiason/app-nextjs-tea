'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function GraciasPage() {
  const [donorName, setDonorName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    // Intentar recuperar información de la donación desde localStorage
    const donationData = localStorage.getItem('lastDonation');
    if (donationData) {
      try {
        const parsedData = JSON.parse(donationData);
        setDonorName(parsedData.firstName || '');
        setAmount(parsedData.amount || '');
      } catch (e) {
        console.error('Error parsing donation data:', e);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-20 w-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#165a91] mb-4">
          ¡Gracias por tu donación!
        </h1>
        
        {donorName && (
          <p className="text-xl text-gray-700 mb-6">
            {donorName}, tu generosidad hace una gran diferencia.
          </p>
        )}
        
        {!donorName && (
          <p className="text-xl text-gray-700 mb-6">
            Tu generosidad hace una gran diferencia.
          </p>
        )}
        
        {amount && (
          <p className="text-lg text-gray-600 mb-8">
            Tu donación de ${parseInt(amount as string).toLocaleString('es-AR')} ayudará a continuar 
            con nuestra misión de apoyar a personas con TEA y sus familias.
          </p>
        )}
        
        {!amount && (
          <p className="text-lg text-gray-600 mb-8">
            Tu donación ayudará a continuar con nuestra misión de apoyar 
            a personas con TEA y sus familias.
          </p>
        )}
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-[#165a91] mb-3">
            ¿Qué lograremos con tu apoyo?
          </h2>
          <ul className="text-left text-gray-700 space-y-2">
            <li>• Ampliar nuestros programas de intervención temprana</li>
            <li>• Brindar capacitación a profesionales y familias</li>
            <li>• Realizar campañas de concientización sobre el TEA</li>
            <li>• Mejorar la calidad de vida de las personas con TEA</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            href="/donaciones"
            className="px-6 py-3 bg-[#f6bb3f] text-white font-semibold rounded-md hover:bg-[#e17a2d] transition-colors"
          >
            Realizar otra donación
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

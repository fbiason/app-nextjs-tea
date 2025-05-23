'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function GraciasPage() {
  const [donorName, setDonorName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Definir el tipo de datos de la donación
  interface DonationData {
    amount: string;
    frequency: string;
    anonymous: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    [key: string]: string | number | boolean | undefined; // Para cualquier otro campo que pueda venir
  }
  
  // Función para guardar la donación en la base de datos
  const saveDonationToDatabase = useCallback(async (donationData: DonationData, paymentId: string) => {
    try {
      // Preparar los datos para enviar al endpoint
      const dataToSave = {
        ...donationData,
        paymentId,
        name: `${donationData.firstName || ''} ${donationData.lastName || ''}`.trim(),
        email: donationData.email,
        phone: donationData.phone
      };
      
      // Verificar y corregir los datos antes de enviarlos
      if (!dataToSave.amount || parseInt(dataToSave.amount) < 5000) {
        console.warn('Corrigiendo monto mínimo a 5000');
        dataToSave.amount = "5000";
      }
      
      // Verificar si es anónimo basado en los datos reales
      const isReallyAnonymous = !dataToSave.firstName && !dataToSave.lastName && !dataToSave.email;
      if (dataToSave.anonymous !== isReallyAnonymous) {
        console.warn(`Corrigiendo estado anónimo: ${dataToSave.anonymous} -> ${isReallyAnonymous}`);
        dataToSave.anonymous = isReallyAnonymous;
      }
      
      console.log('Intentando guardar donación con datos:', {
        amount: dataToSave.amount,
        paymentId: dataToSave.paymentId,
        email: dataToSave.email,
        anonymous: dataToSave.anonymous,
        name: dataToSave.name
      });
      
      // Enviar los datos al endpoint
      const response = await fetch('/api/donations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error al guardar la donación. Status: ${response.status}. Respuesta:`, errorText);
        
        // Intentar guardar en localStorage como respaldo
        const failedDonations = JSON.parse(localStorage.getItem('failedDonations') || '[]');
        failedDonations.push({
          ...dataToSave,
          timestamp: new Date().toISOString(),
          error: `Status: ${response.status}`
        });
        localStorage.setItem('failedDonations', JSON.stringify(failedDonations));
        console.log('Donación guardada en localStorage como respaldo');
        
        return;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error al guardar la donación:', result.error);
        
        // Intentar guardar en localStorage como respaldo
        const failedDonations = JSON.parse(localStorage.getItem('failedDonations') || '[]');
        failedDonations.push({
          ...dataToSave,
          timestamp: new Date().toISOString(),
          error: result.error
        });
        localStorage.setItem('failedDonations', JSON.stringify(failedDonations));
        console.log('Donación guardada en localStorage como respaldo');
      } else {
        console.log('Donación guardada exitosamente:', result.donation.id);
      }
    } catch (error) {
      console.error('Error al guardar la donación:', error);
      
      // Intentar guardar en localStorage como respaldo
      try {
        const failedDonations = JSON.parse(localStorage.getItem('failedDonations') || '[]');
        failedDonations.push({
          ...donationData,
          paymentId,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
        localStorage.setItem('failedDonations', JSON.stringify(failedDonations));
        console.log('Donación guardada en localStorage como respaldo');
      } catch (localStorageError) {
        console.error('Error al guardar en localStorage:', localStorageError);
      }
    }
  }, []);

  useEffect(() => {
    // Obtener los parámetros de la URL
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const status = searchParams.get('status') || searchParams.get('collection_status');
    
    // Intentar recuperar información de la donación desde localStorage
    const donationData = localStorage.getItem('lastDonation');
    if (donationData && paymentId && status === 'approved') {
      try {
        const parsedData = JSON.parse(donationData);
        
        // Verificar que los datos sean válidos
        console.log('Datos recuperados de localStorage:', parsedData);
        
        // Asegurarse de que el monto sea al menos 5000
        if (parsedData.amount && parseInt(parsedData.amount) < 5000) {
          console.warn('Monto menor a 5000 detectado, estableciendo mínimo de 5000');
          parsedData.amount = "5000";
        }
        
        // Establecer valores para mostrar en la página
        setDonorName(parsedData.firstName || '');
        setAmount(parsedData.amount || '');
        
        // Guardar la donación en la base de datos
        saveDonationToDatabase(parsedData, paymentId);
      } catch (e) {
        console.error('Error parsing donation data:', e);
      }
    } else if (donationData) {
      try {
        const parsedData = JSON.parse(donationData);
        setDonorName(parsedData.firstName || '');
        setAmount(parsedData.amount || '');
      } catch (e) {
        console.error('Error parsing donation data:', e);
      }
    }
  }, [saveDonationToDatabase]);

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

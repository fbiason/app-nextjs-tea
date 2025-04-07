'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Check, ExternalLink } from 'lucide-react';

export default function MercadoPagoAuthPage() {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Verificar si ya hay una conexión activa
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/mercadopago/status');
        const data = await response.json();
        
        if (data.success && data.connected) {
          setConnected(true);
        } else {
          // Obtener la URL de autorización
          const authResponse = await fetch('/api/mercadopago/authorize');
          const authData = await authResponse.json();
          
          if (authData.success) {
            setAuthUrl(authData.url);
          } else {
            setError(authData.error || 'Error al obtener la URL de autorización');
          }
        }
      } catch (err) {
        setError('Error al verificar la conexión con MercadoPago');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#165a91] mb-8 text-center">
        Configuración de MercadoPago
      </h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Integración con MercadoPago</CardTitle>
          <CardDescription>
            Conecta tu cuenta de MercadoPago para recibir donaciones
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e17a2d]"></div>
            </div>
          ) : connected ? (
            <div className="bg-green-50 p-6 rounded-lg flex items-start space-x-4">
              <Check className="text-green-500 h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Cuenta conectada correctamente</h3>
                <p className="text-green-700 mt-2">
                  Tu cuenta de MercadoPago está conectada y lista para recibir donaciones.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-lg flex items-start space-x-4">
              <AlertCircle className="text-red-500 h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800 text-lg">Error de conexión</h3>
                <p className="text-red-700 mt-2">{error}</p>
                <p className="text-red-700 mt-2">
                  Por favor, intenta nuevamente o contacta al soporte técnico.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-[#165a91] text-lg mb-3">
                  ¿Por qué conectar con MercadoPago?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Recibir donaciones de forma segura</li>
                  <li>• Gestionar los pagos desde tu cuenta de MercadoPago</li>
                  <li>• Acceder a reportes detallados de donaciones</li>
                  <li>• Ofrecer múltiples métodos de pago a los donantes</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-[#e17a2d] text-lg mb-3">
                  Pasos para conectar tu cuenta
                </h3>
                <ol className="space-y-2 text-gray-700 list-decimal pl-5">
                  <li>Haz clic en el botón &quot;Conectar con MercadoPago&quot; a continuación</li>
                  <li>Inicia sesión en tu cuenta de MercadoPago si es necesario</li>
                  <li>Revisa y acepta los permisos solicitados</li>
                  <li>Serás redirigido de vuelta a esta aplicación</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center pt-4">
          {!loading && !connected && !error && authUrl && (
            <Button 
              className="bg-[#009ee3] hover:bg-[#007eb5] flex items-center space-x-2"
              size="lg"
              onClick={() => window.location.href = authUrl}
            >
              <span>Conectar con MercadoPago</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          {!loading && !connected && error && (
            <Button 
              className="bg-gray-600 hover:bg-gray-700"
              onClick={() => window.location.reload()}
            >
              Intentar nuevamente
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

import DonationForm from '@/components/DonationForm';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, CreditCard, Heart, Landmark, MessageCircle, Shield, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const DonationPage = () => {

    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-[#165a91] via-blue-600 to-blue-800 text-white py-24">
                    <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

                    <div className="relative z-10 container mx-auto text-center px-6">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight font-montserrat">
                            DONA PARA AYUDARNOS A PROMOVER LA INCLUSIÓN DE PERSONAS CON TEA
                        </h1>

                        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90 drop-shadow-sm">
                            Con tu donación contribuyes a mejorar la calidad de vida de personas con TEA y sus familias.
                        </p>

                        <Button 
                            className="bg-white text-[#165a91] hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                            onClick={() => {
                                document.getElementById('formulario-donacion')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Heart className="mr-2" size={24} />
                            Donar Ahora
                        </Button>
                    </div>
                </div>

{/* Nuestras Acciones */}
<section className="py-12 bg-white">
  <div className="container mx-auto px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-tea-blue mb-6 text-center">Nuestras Acciones</h2>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-4xl mx-auto">
        Desde Fundación TEA Santa Cruz desarrollamos acciones que promueven la inclusión, el acceso a derechos y el fortalecimiento de redes de apoyo para personas con Trastorno del Espectro Autista (TEA) y sus familias.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* MaTEAmos */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Ma</span>
            <span style={{ color: '#e17a2d' }}>TEA</span>
            <span style={{ color: '#99b169' }}>mos</span>
          </h3>
          <p className="text-gray-700 text-xs">Espacio de encuentro para familiares de personas con condición del espectro autista, donde se comparten sentires y experiencias.</p>
        </div>

        {/* PileTEAmos */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Pile</span>
            <span style={{ color: '#e17a2d' }}>TEA</span>
            <span style={{ color: '#99b169' }}>mos</span>
          </h3>
          <p className="text-gray-700 text-xs">Promoción de la actividad acuática y sus beneficios a través de la articulación con el Club Hispano Americano.</p>
        </div>

        {/* Orientación Legal */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Orientación</span>{' '}
            <span style={{ color: '#e17a2d' }}>Legal</span>
          </h3>
          <p className="text-gray-700 text-xs">Orientación legal gratuita promoviendo el acceso a información que permita la defensa de los derechos de personas con TEA.</p>
        </div>

        {/* TEAcompaña */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#e17a2d' }}>TEA</span>
            <span style={{ color: '#99b169' }}>compaña</span>
          </h3>
          <p className="text-gray-700 text-xs">Despliegue territorial para conectar localidades de Santa Cruz con la Fundación, promoviendo el trabajo articulado.</p>
        </div>

        {/* Congresos Internacionales */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Congresos</span>{' '}
            <span style={{ color: '#e17a2d' }}>Internacionales</span>
          </h3>
          <p className="text-gray-700 text-xs">Eventos internacionales de formación para promover la actualización del conocimiento y conexión con profesionales.</p>
        </div>

        {/* ITEA */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>I</span>
            <span style={{ color: '#e17a2d' }}>TE</span>
            <span style={{ color: '#99b169' }}>A</span>
          </h3>
          <p className="text-gray-700 text-xs">Instituto para Trastornos del Espectro Autista, escuela especial que garantiza el acceso a la educación de niños con TEA.</p>
        </div>

        {/* Familias para Familias */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Familias</span>{' '}
            <span style={{ color: '#e17a2d' }}>para</span>{' '}
            <span style={{ color: '#99b169' }}>Familias</span>
          </h3>
          <p className="text-gray-700 text-xs">Espacio de encuentros y talleres dictados por personas con condición del espectro autista o sus familiares.</p>
        </div>

        {/* Hacia el empoderamiento */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Hacia el</span>{' '}
            <span style={{ color: '#e17a2d' }}>empoderamiento</span>{' '}
            <span style={{ color: '#99b169' }}>de las Familias</span>
          </h3>
          <p className="text-gray-700 text-xs">Talleres teóricos prácticos para docentes, familias y cuidadores de niños con condición del espectro autista.</p>
        </div>

        {/* Talleres recreativos */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Talleres</span>{' '}
            <span style={{ color: '#e17a2d' }}>recreativos</span>
          </h3>
          <p className="text-gray-700 text-xs">Talleres de relajación, baile y arte para niños y jóvenes, promoviendo la socialización e integración.</p>
        </div>

        {/* Colonia de vacaciones */}
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">
            <span style={{ color: '#f6bb3f' }}>Colonia</span>{' '}
            <span style={{ color: '#e17a2d' }}>de</span>{' '}
            <span style={{ color: '#99b169' }}>vacaciones</span>
          </h3>
          <p className="text-gray-700 text-xs">Espacio recreativo para el disfrute del tiempo libre en periodo vacacional, destinado a niños y jóvenes con y sin discapacidad.</p>
        </div>
      </div>

      <p className="text-xl font-semibold text-tea-blue text-center mt-10">
        ¡Gracias por ser parte de este camino hacia una sociedad más inclusiva!
      </p>
    </div>
  </div>
</section>



                {/* Formulario de donación */}
                <section className="py-16 bg-white" id="formulario-donacion">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-6">Realiza una Donación Online</h2>
                        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
                            Puedes realizar una donación única o recurrente a través de nuestro sistema seguro.
                            Todos los pagos están encriptados y protegidos.
                        </p>

                        <Card className="max-w-4xl mx-auto shadow-lg">
                            <CardContent className="pt-6">
                                <DonationForm />
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Métodos de donación */}
                <section className="py-20 bg-[#f9fafb]">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#165a91] font-montserrat">
                            Formas de Ayudar
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Transferencia Bancaria */}
                            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border flex flex-col justify-between h-full">
                                <div className="bg-[#f6bb3f]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Landmark size={32} className="text-[#f6bb3f]" />
                                </div>
                                <h3 className="text-xl font-bold text-center mb-4 text-[#e17a2d]">Transferencia Bancaria</h3>
                                <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm">
                                    <p className="font-medium text-gray-800">Banco:</p>
                                    <p className="text-gray-600 mb-2">Banco de Santa Cruz</p>

                                    <p className="font-medium text-gray-800">Titular:</p>
                                    <p className="text-gray-600 mb-2">Fundación TEA Santa Cruz</p>

                                    <p className="font-medium text-gray-800">CBU:</p>
                                    <p className="text-gray-600 mb-2">0860001101800032650015</p>

                                    <p className="font-medium text-gray-800">Alias:</p>
                                    <p className="text-gray-600">FUNDACION.TEA.SANTACRUZ</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full border-[#f6bb3f] text-[#e17a2d] hover:bg-[#f6bb3f] hover:text-white"
                                    onClick={() => {
                                        navigator.clipboard.writeText('0860001101800032650015');
                                        alert('CBU copiado al portapapeles');
                                    }}
                                >
                                    Copiar CBU
                                </Button>
                            </div>

                            {/* MercadoPago */}
                            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-[#165a91]/30 flex flex-col justify-between h-full">
                                <div>
                                    <div className="bg-[#165a91]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CreditCard size={32} className="text-[#165a91]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-4 text-[#165a91]">MercadoPago</h3>

                                    <div className="flex justify-center mb-4">
                                        <div className="w-48 h-48 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src="/images/qr-tea.png"
                                                alt="QR MercadoPago"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/200x200/eee/31a5e7?text=QR+MercadoPago';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-center text-sm">
                                        Escaneá el código QR con la app de MercadoPago para realizar tu donación.
                                    </p>
                                </div>

                                <Button 
                                    className="w-full mt-6 bg-[#165a91] hover:bg-[#1d4ed8] text-white font-semibold"
                                    onClick={() => {
                                        // Crear un enlace para descargar la imagen
                                        const link = document.createElement('a');
                                        link.href = '/images/qr-tea.png';
                                        link.download = 'QR-Fundacion-TEA-Santa-Cruz.png';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                >
                                    Descargar QR
                                </Button>
                            </div>


                            {/* WhatsApp */}
                            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-green-500/20 flex flex-col justify-between h-full">
                                <div>
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageCircle size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-4 text-green-700">Contacto Directo</h3>
                                    <div className="flex justify-center mb-4">
                                        <div className="w-48 h-48 bg-white flex items-center justify-center overflow-hidden">
                                            <img
                                                src="/images/dona-whatsapp.png"
                                                alt="Dona por WhatsApp"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/200x200/e4ffe4/25d366?text=WhatsApp';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-center mb-4">
                                        Si tenés dudas o necesitás asistencia para donar, escribinos por WhatsApp y te guiamos en el proceso.
                                    </p>
                                </div>

                                <a
                                    href="https://wa.me/5492966447655?text=Hola,%20quiero%20realizar%20una%20donación%20a%20la%20Fundación%20TEA%20Santa%20Cruz."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full bg-green-500 hover:bg-green-600 mt-4">
                                        <MessageCircle className="mr-2" size={20} />
                                        Contactar por WhatsApp
                                    </Button>
                                </a>
                            </div>

                        </div>
                    </div>
                </section>


                {/* Sección de agradecimiento */}
                <section className="py-16 bg-gradient-to-r from-[#165a91] to-blue-700 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-6 text-white">¡Gracias por tu Apoyo!</h2>
                        <p className="text-lg max-w-3xl mx-auto mb-8 text-blue-100">
                            Cada donación nos permite continuar desarrollando programas y actividades
                            para mejorar la calidad de vida de las personas con TEA y sus familias en Santa Cruz.
                            Tu aporte hace la diferencia.
                        </p>
                        <div className="mt-12 flex items-center justify-center text-blue-100">
                            <Shield size={20} className="mr-2" />
                            <p className="text-sm">Todas las transacciones son seguras y están encriptadas</p>
                        </div>
                    </div>
                </section>

            </div>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={handleBackToTop}
                    className="fixed bottom-8 right-8 bg-gradient-to-r from-[#f6bb3f] via-[#e17a2d] to-[#99b169] p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50 text-white"
                    aria-label="Volver arriba"
                >
                    <ArrowUp size={24} />
                </button>
            )}

            <Footer />
        </div>
    );
};

export default DonationPage;

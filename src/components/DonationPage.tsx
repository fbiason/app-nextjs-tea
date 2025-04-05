'use client';

import DonationForm from '@/components/DonationForm';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, CreditCard, Heart, Landmark, MessageCircle, Shield } from 'lucide-react';

const DonationPage = () => {

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-[#165a91] via-blue-600 to-blue-800 text-white py-24">
  <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

  <div className="relative z-10 container mx-auto text-center px-6">
    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight font-montserrat">
      DONA PARA AYUDARNOS A PROMOVER LA INCLUSIÓN DE PERSONAS CON TEA EN RÍO GALLEGOS
    </h1>

    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90 drop-shadow-sm">
      Con tu donación contribuyes a mejorar la calidad de vida de personas con TEA y sus familias.
    </p>

    <Button className="bg-white text-[#165a91] hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all">
      <Heart className="mr-2" size={24} />
      Donar Ahora
    </Button>
  </div>
</div>

                {/* Mensaje inspirador */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-lg text-gray-700 mb-6">
                                La Fundación TEA Santa Cruz desarrolla programas a través de los cuales promovemos la inclusión de las personas con Trastorno del Espectro Autista en nuestra sociedad.
                            </p>
                            <p className="text-lg text-gray-700 mb-6">
                                Tu apoyo nos permite ampliar el impacto de nuestros programas vigentes y poder proyectarnos de un modo sostenible.
                            </p>
                            <p className="text-lg text-gray-700 mb-6">
                                Nuestros programas actuales:
                            </p>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-tea-blue mb-2">1. Programa de Acompañamiento Educativo</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Ofrecer los apoyos específicos para la inclusión de niños, niñas y jóvenes con TEA dentro del ámbito de la educación común</li>
                                    <li>Sensibilizar a la comunidad educativa para que cada infancia o juventud con TEA tenga participación plena en su escuela y en su primer contexto social</li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-tea-blue mb-2">2. Programa de Actividades Recreativas y Vínculos</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Facilitar espacios de participación social y recreativa para niños, niñas y jóvenes con TEA</li>
                                    <li>Promover encuentros sociales y actividades de esparcimiento que mejoren la calidad de vida</li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-tea-blue mb-2">3. Programa Familias Informadas, Familias EMPODERADAS</h3>
                                <p>Esta es una línea de acción que brinda información, formación y apoyo a las familias de personas con TEA.</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-tea-blue mb-2">4. Programa Inclusión laboral</h3>
                                <p>Buscamos sensibilizar a empresas y organizaciones para facilitar la inclusión laboral de personas jóvenes y adultas con TEA.</p>
                            </div>

                            <p className="text-xl font-semibold text-tea-blue text-center mt-8">
                                ¡GRACIAS por tu apoyo a la Inclusión de personas con TEA!
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

  <Button className="w-full mt-6 bg-[#165a91] hover:bg-[#1d4ed8] text-white font-semibold">
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
    <p className="text-gray-600 text-center mb-8">
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

{/* Beneficios de tu donación */}
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12 text-[#165a91]">
      Beneficios de tu Donación
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Programas Educativos */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <CheckCircle2 className="text-[#f6bb3f] mb-4 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-center mb-2 text-[#f6bb3f]">
          Programas Educativos
        </h3>
        <p className="text-gray-600 text-center">
          Tu donación financia programas educativos adaptados para niños y jóvenes con TEA.
        </p>
      </div>

      {/* Apoyo a Familias */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <CheckCircle2 className="text-[#e17a2d] mb-4 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-center mb-2 text-[#e17a2d]">
          Apoyo a Familias
        </h3>
        <p className="text-gray-600 text-center">
          Ayudás a proporcionar orientación y apoyo a las familias de personas con TEA.
        </p>
      </div>

      {/* Actividades Recreativas */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
        <CheckCircle2 className="text-[#99b169] mb-4 mx-auto" size={48} />
        <h3 className="text-xl font-bold text-center mb-2 text-[#99b169]">
          Actividades Recreativas
        </h3>
        <p className="text-gray-600 text-center">
          Financiás actividades recreativas y terapéuticas que mejoran la calidad de vida.
        </p>
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

    <div className="flex flex-wrap justify-center gap-4">
      <Button
        className="bg-white text-[#165a91] hover:bg-gray-100 font-semibold"
        onClick={() => window.location.href = "/acciones"}
      >
        Conoce Nuestros Programas
      </Button>
      <Button
        variant="outline"
        className="border-white text-white hover:bg-white hover:text-[#165a91] font-semibold"
        onClick={() => window.location.href = "/contacto"}
      >
        Contactar con Nosotros
      </Button>
    </div>

    <div className="mt-12 flex items-center justify-center text-blue-100">
      <Shield size={20} className="mr-2" />
      <p className="text-sm">Todas las transacciones son seguras y están encriptadas</p>
    </div>
  </div>
</section>

            </div>

            <Footer />
        </div>
    );
};

export default DonationPage;

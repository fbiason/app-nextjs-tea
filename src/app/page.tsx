'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ProgramsSection from '@/components/ProgramsSection';
import Footer from '@/components/Footer';
//import { Button } from "@/components/ui/button";
import Image from 'next/image';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AboutSection />
      <ProgramsSection />

      {/* Placeholder para la sección de Auspiciantes */}
      <section className="section bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-tea-yellow mb-4">
            Nuestros <span className="text-tea-orange">Auspiciantes</span>
          </h2>
          <div className="w-20 h-1 bg-tea-green mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Empresas e instituciones que nos apoyan para hacer posible nuestra labor.
          </p>

          {/* Grid para logos de auspiciantes (placeholders) */}
{/* Grid con logos reales de auspiciantes */}
{/* Grid con logos de auspiciantes con efecto hover y nombre debajo */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
  {[
    { name: 'SSServicios', src: '/images/auspiciantes/SSServicios.png' },
    { name: 'Municipalidad de Río Gallegos', src: '/images/auspiciantes/muni-rgl.png' },
    { name: 'Romero Sistemas', src: '/images/auspiciantes/RomeroSistemas.png' },
    { name: 'Fundación San Juan Bosco', src: '/images/auspiciantes/fundacion-san-juan.png' },
  ].map((sponsor) => (
    <div
      key={sponsor.name}
      className="flex flex-col items-center group transition-transform duration-300"
    >
      <Image
        src={sponsor.src}
        alt={sponsor.name}
        width={128}
        height={128}
        className="h-32 grayscale group-hover:grayscale-0 group-hover:scale-110 transition duration-300 object-contain"
      />
      <p className="mt-2 text-sm text-gray-500 group-hover:text-tea-dark transition-colors text-center">
        {sponsor.name}
      </p>
    </div>
  ))}
</div>

        </div>
      </section>
      
      {/* Placeholder para la sección de FAQ */}
      <section className="section bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-tea-yellow mb-4">
            Preguntas <span className="text-tea-orange">Frecuentes</span>
          </h2>
          <div className="w-20 h-1 bg-tea-green mx-auto mb-6"></div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md mb-4 text-left">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">¿Qué es el Trastorno del Espectro Autista?</h3>
              </div>
              <div className="p-4 text-gray-600">
                El Trastorno del Espectro Autista (TEA) es un trastorno neurobiológico del desarrollo que afecta la comunicación,
                la interacción social y puede incluir patrones restrictivos y repetitivos de comportamiento.
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md mb-4 text-left">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">¿Cómo puedo colaborar con la fundación?</h3>
              </div>
              <div className="p-4 text-gray-600">
                Puedes colaborar de múltiples formas: como voluntario, realizando donaciones económicas o en especie,
                difundiendo nuestras actividades o participando en nuestros eventos de concientización.
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md text-left">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">¿Qué servicios ofrece la fundación?</h3>
              </div>
              <div className="p-4 text-gray-600">
                Ofrecemos programas educativos, recreativos, orientación legal, apoyo a familias,
                capacitaciones para profesionales y eventos de concientización.
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Placeholder para la sección de Contacto */}
      <section className="section bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-tea-yellow mb-4">
            Contacta<span className="text-tea-orange"> con </span> <span className="text-tea-green">Nosotros</span>
          </h2>
          <div className="w-20 h-1 bg-tea-blue mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Estamos aquí para responderte. Completa el formulario y nos pondremos en contacto contigo a la brevedad.
          </p>
          
          <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Asunto"
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
              <textarea
                placeholder="Mensaje"
                rows={4}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              ></textarea>
              <Button className="w-full bg-tea-green hover:bg-green-600">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;

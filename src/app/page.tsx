'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import ProgramsSection from '@/components/ProgramsSection';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  {
    question: '¿Qué es el Trastorno del Espectro Autista?',
    answer:
      'El Trastorno del Espectro Autista (TEA) es un trastorno neurobiológico del desarrollo que afecta la comunicación, la interacción social y puede incluir patrones restrictivos y repetitivos de comportamiento.',
  },
  {
    question: '¿Cómo puedo colaborar con la fundación?',
    answer:
      'Puedes colaborar de múltiples formas: como voluntario, realizando donaciones económicas o en especie, difundiendo nuestras actividades o participando en nuestros eventos de concientización.',
  },
  {
    question: '¿Qué servicios ofrece la fundación?',
    answer:
      'Ofrecemos programas educativos, recreativos, orientación legal, apoyo a familias, capacitaciones para profesionales y eventos de concientización.',
  },
];

const Index = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AboutSection />
      <ProgramsSection />

      {/* Auspiciantes */}
      <section className="section bg-white py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
            <span style={{ color: '#f6bb3f' }}>Nuestros</span>{" "}
            <span style={{ color: '#e17a2d' }}>Auspiciantes</span>
          </h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: '#99b169' }}></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Empresas e instituciones que nos apoyan para hacer posible nuestra labor.
          </p>

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

      {/* Preguntas Frecuentes */}
      <section className="section bg-gray-50 py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
            <span style={{ color: '#f6bb3f' }}>Preguntas</span>{" "}
            <span style={{ color: '#e17a2d' }}>Frecuentes</span>
          </h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: '#99b169' }}></div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md mb-4 text-left transition-all"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full p-4 flex justify-between items-center border-b focus:outline-none"
                >
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div
  className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
    openIndex === index ? 'max-h-96' : 'max-h-0'
  }`}
>
  <div className="p-4 text-gray-600">{faq.answer}</div>
</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="section bg-white py-20">
        <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat" style={{ color: '#165a91' }}>
  Contacta con Nosotros
</h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: '#e17a2d' }}></div>
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
              <Button className="w-full bg-[#99b169] hover:bg-green-600 text-white font-semibold">
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

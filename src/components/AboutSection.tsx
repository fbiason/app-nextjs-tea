import React from 'react';
import { Heart, Users, Star, Award } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="section bg-white">
      <div className="container mx-auto">
        {/* Encabezado principal */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tea-yellow mb-4">
            Sobre <span className="text-tea-blue">Nosotros</span>
          </h2>
          <div className="w-20 h-1 bg-tea-green mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Somos una organización sin fines de lucro dedicada a mejorar la calidad de vida 
            de las personas con Trastorno del Espectro Autista y sus familias.
          </p>
        </div>

        {/* Cards de valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-tea-blue" />
            </div>
            <h3 className="text-xl font-bold mb-2">Compromiso</h3>
            <p className="text-gray-600">
              Estamos comprometidos con la inclusión y el bienestar de todas las personas con TEA.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-tea-green" />
            </div>
            <h3 className="text-xl font-bold mb-2">Comunidad</h3>
            <p className="text-gray-600">
              Trabajamos junto a las familias y la comunidad para crear un entorno inclusivo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-tea-orange" />
            </div>
            <h3 className="text-xl font-bold mb-2">Objetivos</h3>
            <p className="text-gray-600">
              Buscamos generar oportunidades reales de desarrollo e inclusión social.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Apoyo</h3>
            <p className="text-gray-600">
              Brindamos orientación y apoyo a familias y profesionales en todas las etapas.
            </p>
          </div>
        </div>

        {/* Sección de autoridades */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-tea-green mb-4">Autoridades</h3>
          <div className="w-20 h-1 bg-tea-orange mx-auto mb-6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Presidente */}
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/presidente.webp"
              alt="LAMAS Silvina Betiana"
              className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-tea-yellow">LAMAS Silvina Betiana</h4>
            <p className="text-gray-600">Presidente</p>
          </div>

          {/* Tesorera */}
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/tesorero.webp"
              alt="GONZALEZ Laura Gabriela"
              className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-tea-green">GONZALEZ Laura Gabriela</h4>
            <p className="text-gray-600">Tesorera</p>
          </div>

          {/* Secretaria */}
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
            <img
              src="/images/secretario.webp"
              alt="CASAS Mavis Liliana"
              className="w-48 h-48 object-cover rounded-full mx-auto mb-4"
            />
            <h4 className="text-xl font-bold text-tea-blue">CASAS Mavis Liliana</h4>
            <p className="text-gray-600">Secretaria</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

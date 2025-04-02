import React from 'react';
import { Button } from '@/components/ui/button';

const programs = [
  {
    id: 'mateamos',
    name: 'MaTEAmos',
    image: '/images/acciones/mateamos.jpg',
    description:
      'Encuentro diseñado para familias, promoviendo inclusión, diálogo y estrategias compartidas sobre el abordaje del TEA.',
    fullDescription:
      '"MaTEAmos" es un encuentro diseñado especialmente para familiares de personas TEA... (texto completo si se requiere)',
  },
  {
    id: 'pileteamos',
    name: 'PileTEAmos',
    image: '/images/acciones/pileteamos.jpeg',
    description:
      'Actividades acuáticas terapéuticas que promueven la integración sensorial y habilidades sociales.',
    fullDescription:
      'PileTEAmos tiene por objetivo brindar a los asistentes todas las propiedades de la terapia acuática...'
  },
  {
    id: 'legal',
    name: 'Orientación Legal',
    image: '/images/acciones/legal.jpg',
    description:
      'Asesoramiento jurídico sobre derechos y servicios, promoviendo la defensa legal de las personas con TEA.',
    fullDescription:
      'El Conversatorio y Orientación Legal de personas con TEA es un evento especialmente diseñado...'
  },
  {
    id: 'teacompana',
    name: 'TEAcompaña',
    image: '/images/acciones/teacompañamos.png',
    description:
      'Despliegue territorial para conectar localidades de Santa Cruz con la Fundación, promoviendo comunicación y concientización.',
    fullDescription:
      'La Fundación T.E.A. Santa Cruz, con sede en la ciudad de Río Gallegos...'
  },
  {
    id: 'congresos',
    name: 'Congresos Internacionales',
    image: '/images/acciones/congresos.jpeg',
    description:
      'Eventos internacionales para compartir avances, experiencias e impulsar políticas públicas inclusivas.',
    fullDescription:
      'Participamos y organizamos congresos internacionales que reúnen a expertos de todo el mundo...'
  },
  {
    id: 'itea',
    name: 'ITEA',
    image: '/images/acciones/itea.jpeg',
    description:
      'Instituto de formación en TEA que combina tecnología, educación y personalización de recursos.',
    fullDescription:
      'ITEA es un programa innovador que combina la tecnología con la educación...'
  },
  {
    id: 'familias',
    name: 'Familias para Familias',
    image: '/images/acciones/familias-para-familias.jpeg',
    description:
      'Red de contención entre familias con TEA: mentorías, encuentros y aprendizaje compartido.',
    fullDescription:
      'Este programa fomenta el apoyo mutuo entre familias de personas con TEA...'
  },
  {
    id: 'empoderamiento',
    name: 'Empoderamiento de las Familias',
    image: '/images/acciones/empoderamiento.jpeg',
    description:
      'Talleres, charlas y acompañamiento para fortalecer a las familias en el día a día.',
    fullDescription:
      'Este programa tiene como objetivo principal fortalecer y empoderar a las familias...'
  }
];

const ProgramsSection = () => {
  return (
    <section className="section bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tea-yellow mb-4">
            Nuestras <span className="text-tea-orange">Acciones</span>
          </h2>
          <div className="w-20 h-1 bg-tea-green mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desarrollamos programas que impactan en múltiples áreas de la vida de las personas con TEA, promoviendo inclusión, derechos y redes de apoyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col"
            >
              <img
                src={program.image}
                alt={program.name}
                className="h-64 w-full object-cover"
              />
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-tea-dark mb-2">
                  {program.name}
                </h3>
                <p className="text-gray-600 mb-4 flex-grow">
                  {program.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;

import React from 'react';

const programs = [
  {
    id: 'mateamos',
    name: 'MaTEAmos',
    image: '/images/acciones/mateamos.jpg',
    description:
      'Encuentro diseñado para familias, promoviendo inclusión, diálogo y estrategias compartidas sobre el abordaje del TEA.',
  },
  {
    id: 'pileteamos',
    name: 'PileTEAmos',
    image: '/images/acciones/pileteamos.jpeg',
    description:
      'Actividades acuáticas terapéuticas que promueven la integración sensorial y habilidades sociales.',
  },
  {
    id: 'legal',
    name: 'Orientación Legal',
    image: '/images/acciones/legal.jpg',
    description:
      'Asesoramiento jurídico sobre derechos y servicios, promoviendo la defensa legal de las personas con TEA.',
  },
  {
    id: 'teacompana',
    name: 'TEAcompaña',
    image: '/images/acciones/teacompañamos.png',
    description:
      'Despliegue territorial para conectar localidades de Santa Cruz con la Fundación, promoviendo comunicación y concientización.',
  },
  {
    id: 'congresos',
    name: 'Congresos Internacionales',
    image: '/images/acciones/congresos.jpeg',
    description:
      'Eventos internacionales para compartir avances, experiencias e impulsar políticas públicas inclusivas.',
  },
  {
    id: 'itea',
    name: 'ITEA',
    image: '/images/acciones/itea.jpeg',
    description:
      'Instituto de formación en TEA que combina tecnología, educación y personalización de recursos.',
  },
  {
    id: 'familias',
    name: 'Familias para Familias',
    image: '/images/acciones/familias-para-familias.jpeg',
    description:
      'Red de contención entre familias con TEA: mentorías, encuentros y aprendizaje compartido.',
  },
  {
    id: 'empoderamiento',
    name: 'Empoderamiento de las Familias',
    image: '/images/acciones/empoderamiento.jpeg',
    description:
      'Talleres, charlas y acompañamiento para fortalecer a las familias en el día a día.',
  }
];

const ProgramsSection = () => {
  return (
    <section id="acciones" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
            <span style={{ color: '#f6bb3f' }}>Nuestras</span>{" "}
            <span style={{ color: '#e17a2d' }}>Acciones</span>
          </h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: '#99b169' }}></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desarrollamos programas que impactan en múltiples áreas de la vida de las personas con TEA, promoviendo inclusión, derechos y redes de apoyo.
          </p>
        </div>

        {/* Cards de Programas */}
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
                <h3 className="text-2xl font-bold mb-2">
                  {program.name.includes('TEA') ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>
                        {program.name.split('TEA')[0]}
                      </span>
                      <span style={{ color: '#e17a2d' }}>TEA</span>
                      <span style={{ color: '#99b169' }}>
                        {program.name.split('TEA')[1]}
                      </span>
                    </>
                  ) : (
                    <span className="text-[#165a91]">{program.name}</span>
                  )}
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

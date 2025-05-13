import React from 'react';

const programs = [
  {
    id: 'mateamos',
    name: 'MaTEAmos',
    image: '/images/acciones/mateamos.jpg',
    description:
      'Espacio de encuentro para familiares de personas con condición del espectro autista, donde se comparten sentires y experiencias con total libertad, promoviendo el cuidado de la salud mental y el acompañamiento entre personas que transitan el mismo camino.',
  },
  {
    id: 'pileteamos',
    name: 'PileTEAmos',
    image: '/images/acciones/pileteamos.jpeg',
    description:
      'Promoción de la actividad acuática y sus beneficios a través de la articulación con el Club Hispano Americano y la Municipalidad de Río Gallegos.',
  },
  {
    id: 'legal',
    name: 'Orientación Legal',
    image: '/images/acciones/legal.jpg',
    description:
      'Orientación legal gratuita promoviendo el acceso a información que permita la defensa y ejercicio de los derechos de las personas con TEA y sus familias.',
  },
  {
    id: 'teacompana',
    name: 'TEAcompaña',
    image: '/images/acciones/teacompanamos.png',
    description:
      'Despliegue territorial para conectar localidades de Santa Cruz con la Fundación, promoviendo el trabajo articulado en beneficio de las familias santacruceñas.',
  },
  {
    id: 'congresos',
    name: 'Congresos Internacionales',
    image: '/images/acciones/congresos.jpeg',
    description:
      'Eventos internacionales de formación de primer nivel a efectos de promover la actualización del conocimiento, aplicación de metodologías de abordajes con evidencia empírica y la conexión con profesionales, familias y organizaciones alrededor del mundo.',
  },
  {
    id: 'itea',
    name: 'ITEA',
    image: '/images/acciones/itea.jpeg',
    description:
      'Instituto para Trastornos del Espectro Autista, escuela especial de gestión privada, donde se trabaja de manera integral para garantizar el acceso a la educación de niños y jóvenes con TEA. La primera en su tipo en toda la región patagónica.',
  },
  {
    id: 'familias',
    name: 'Familias para Familias',
    image: '/images/acciones/familias-para-familias.jpeg',
    description:
      'Espacio de encuentros, en formato de capacitaciones y talleres, dictados por personas con condición del espectro autista o sus familiares y destinado específicamente a familias con integrantes con la misma condición.',
  },
  {
    id: 'empoderamiento',
    name: 'Hacia el empoderamiento de las Familias',
    image: '/images/acciones/empoderamiento.jpeg',
    description:
      'Talleres teóricos prácticos dictados por profesionales de Fundación TEA Santa Cruz, destinados a docentes de nivel inicial y primario, familias y cuidadores de niños y niñas con condición del espectro autista.',
  },
  {
    id: 'talleres-recreativos',
    name: 'Talleres recreativos',
    image: '/images/acciones/talleres-recreativos.png',
    description:
      'Talleres de relajación, baile, arte, etc., destinados a niños, adolescentes y jóvenes adultos con y sin condición de discapacidad, promoviendo la socialización, disfrute del tiempo libre y habilidades sociales.',
  },
  {
    id: 'colonia-vacaciones',
    name: 'Colonia de vacaciones',
    image: '/images/acciones/colonia-vacaciones.png',
    description:
      'Espacio recreativo destinado al disfrute del tiempo libre en periodo vacacional. Destinado a niños, adolescentes y jóvenes adultos con y sin condición de discapacidad, promoviendo la socialización y desarrollo de habilidades sociales.',
  },
];

const ProgramsSection = () => {
  return (
    <section id="acciones" className="bg-gray-50 py-20 px-4 md:px-0 scroll-mt-32">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat">
            <span style={{ color: '#f6bb3f' }}>Nuestras</span>{" "}
            <span style={{ color: '#e17a2d' }}>Acciones</span>
          </h2>
          <div className="w-20 h-1 mx-auto mb-6" style={{ backgroundColor: '#99b169' }}></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desarrollamos acciones que impactan en múltiples áreas de la vida de las personas con TEA, promoviendo inclusión, derechos y redes de apoyo.
          </p>
        </div>

        {/* Cards de Acciones */}
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
                  ) : program.name === 'Orientación Legal' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Orientación</span>{' '}
                      <span style={{ color: '#e17a2d' }}>Legal</span>
                    </>
                  ) : program.name === 'Congresos Internacionales' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Congresos</span>{' '}
                      <span style={{ color: '#e17a2d' }}>Internacionales</span>
                    </>
                  ) : program.name === 'ITEA' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>I</span>
                      <span style={{ color: '#e17a2d' }}>TE</span>
                      <span style={{ color: '#99b169' }}>A</span>
                    </>
                  ) : program.name === 'Familias para Familias' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Familias</span>{' '}
                      <span style={{ color: '#e17a2d' }}>para</span>{' '}
                      <span style={{ color: '#99b169' }}>Familias</span>
                    </>
                  ) : program.name === 'Hacia el empoderamiento de las Familias' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Hacia el</span>{' '}
                      <span style={{ color: '#e17a2d' }}>empoderamiento</span>{' '}
                      <span style={{ color: '#99b169' }}>de las Familias</span>
                    </>
                  ) : program.name === 'Talleres recreativos' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Talleres</span>{' '}
                      <span style={{ color: '#e17a2d' }}>recreativos</span>
                    </>
                  ) : program.name === 'Colonia de vacaciones' ? (
                    <>
                      <span style={{ color: '#f6bb3f' }}>Colonia</span>{' '}
                      <span style={{ color: '#e17a2d' }}>de</span>{' '}
                      <span style={{ color: '#99b169' }}>vacaciones</span>
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

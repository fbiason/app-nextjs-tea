'use client';

import React, { useState } from 'react';
import { Facebook, Instagram, MessageCircle, Mail, PhoneCall, MapPin, X } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-6 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#f6bb3f]">
              Fundación <span className="text-[#e17a2d]">TEA</span>{" "}
              <span className="text-[#99b169]">Santa Cruz</span>
            </h3>
            <p className="text-gray-300 mb-4">
              Muratore N°444, Río Gallegos, Santa Cruz, Argentina.
            </p>
            <p className="text-gray-300 mb-1">Teléfono: +54 9 2966 44-7655</p>
            <p className="text-gray-300 mb-4">Email: fund.teasantacruz@gmail.com</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces útiles</h3>
            <div className="w-10 h-0.5 bg-[#f6bb3f] mb-4"></div>
            <ul className="space-y-2">
              <li>
                <Link href="/#nosotros" className="text-gray-300 hover:text-white transition-colors">
                  &rsaquo; Nosotros
                </Link>
              </li>
              <li>
                <Link href="/#talleres" className="text-gray-300 hover:text-white transition-colors">
                  &rsaquo; Talleres
                </Link>
              </li>
              <li>
                <Link href="/#noticias" className="text-gray-300 hover:text-white transition-colors">
                  &rsaquo; Noticias
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  &rsaquo; Aviso Legal
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center lg:text-left">
            <h3 className="text-xl font-bold mb-4">Seguinos en nuestras redes</h3>
            <div className="w-10 h-0.5 bg-[#f6bb3f] mb-4 mx-auto lg:mx-0"></div>
            <div className="flex justify-center lg:justify-start space-x-4">
              <a
                href="https://www.facebook.com/FundacionTeaSantaCruz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2d2d2d] p-2 rounded hover:bg-[#1877f2] hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/tea.santacruz/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2d2d2d] p-2 rounded hover:bg-pink-500 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://wa.me/5492966447655"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#2d2d2d] p-2 rounded hover:bg-green-500 hover:text-white transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            {currentYear}{" "}
            <a
              href="https://francobiason.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f6bb3f]"
            >
              FBDev
            </a>{" "}
            -{" "}
            <a
              href="https://www.m25.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f6bb3f]"
            >
              MVDev
            </a>. All Rights Reserved.
          </p>
        </div>
      </div>

      <LegalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </footer>
  );
};

export default Footer;

// Componente modal para Aviso Legal
const LegalModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-800/50 flex items-center justify-center z-50">
<div className="bg-white text-black rounded-lg max-w-3xl w-full p-6 sm:px-6 mx-4 sm:mx-0 overflow-y-auto max-h-[80vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-black"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#e17a2d]">AVISO LEGAL</h2>

        <p className="mb-2"><strong>Identificación y Titularidad</strong><br />
        Presidente: LAMAS, Silvina Betiana<br />
        Personería Jurídica N° 050. Disposición N° 557/07<br />
        Domicilio: Muratore N°444, Río Gallegos, Santa Cruz, Argentina.<br />
        Correo electrónico: fund.teasantacruz@gmail.com<br />
        Teléfono de contacto: 2966 44-7655</p>

        <p className="mb-2"><strong>Información General</strong><br />
        La Fundación TEA Santa Cruz es una organización sin fines de lucro dedicada a apoyar a las personas con Trastorno del Espectro Autista (TEA)...</p>

        <p className="mb-2"><strong>Propiedad Intelectual</strong><br />
        Todos los derechos de propiedad intelectual sobre los contenidos del sitio web... están protegidos.</p>

        <p className="mb-2"><strong>Enlaces a Terceros</strong><br />
        Este sitio puede contener enlaces externos... No nos responsabilizamos por su contenido.</p>

        <p className="mb-2"><strong>Responsabilidad</strong><br />
        Nos esforzamos por mantener la información actualizada, pero su uso es bajo tu propio riesgo.</p>

        <p className="mb-2"><strong>Privacidad</strong><br />
        Te recomendamos revisar nuestra Política de Privacidad para más información.</p>

        <p className="mb-2"><strong>Ley Aplicable y Jurisdicción</strong><br />
        Estas condiciones se rigen por las leyes de Santa Cruz, Argentina.</p>

        <p className="text-sm text-gray-600 mt-4">Última actualización: 1/04/2025</p>
      </div>
    </div>
  );
};

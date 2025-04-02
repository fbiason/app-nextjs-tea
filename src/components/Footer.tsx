
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MessageCircle, Mail, PhoneCall, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-tea-dark text-white pt-12 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="text-xl font-bold mb-4">Fundación TEA Santa Cruz</h3>
            <p className="text-gray-300 mb-4">
              Trabajamos para mejorar la calidad de vida de las personas con Trastorno del Espectro Autista y sus familias.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-tea-blue transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-tea-blue transition-colors"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="https://wa.me/5491100000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-tea-green transition-colors"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  <span>Sobre</span>{' '}
                  <span>Nosotros</span>
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  <span>Contacto</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Programas</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/acciones#mateamos" className="text-gray-300 hover:text-white transition-colors">
                  MaTEAmos
                </Link>
              </li>
              <li>
                <Link to="/acciones#pileteamos" className="text-gray-300 hover:text-white transition-colors">
                  PileTEAmos
                </Link>
              </li>
              <li>
                <Link to="/acciones#legal" className="text-gray-300 hover:text-white transition-colors">
                  Orientación Legal
                </Link>
              </li>
              <li>
                <Link to="/acciones#teacompana" className="text-gray-300 hover:text-white transition-colors">
                  TEAcompaña
                </Link>
              </li>
              <li>
                <Link to="/acciones#congresos" className="text-gray-300 hover:text-white transition-colors">
                  Congresos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">Río Gallegos, Santa Cruz, Argentina</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 flex-shrink-0" />
                <a href="mailto:info@fundacionteasantacruz.org" className="text-gray-300 hover:text-white transition-colors">
                  info@fundacionteasantacruz.org
                </a>
              </li>
              <li className="flex items-center">
                <PhoneCall size={20} className="mr-2 flex-shrink-0" />
                <a href="tel:+5491100000000" className="text-gray-300 hover:text-white transition-colors">
                  +54 9 11 0000-0000
                </a>
              </li>
              <li className="flex items-center">
                <MessageCircle size={20} className="mr-2 flex-shrink-0" />
                <a href="https://wa.me/5491100000000" className="text-gray-300 hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Fundación TEA Santa Cruz. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

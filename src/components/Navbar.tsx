'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navigationLinks = [
  { name: "Nosotros", href: "#nosotros" },
  { name: "Acciones", href: "#acciones" },
  { name: "Contacto", href: "#contacto" },
  { name: "Donaciones", href: "/donaciones" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Topbar */}
      <div className="w-full bg-gradient-to-r from-tea-green to-blue-500 text-white text-sm text-center py-1.5 font-montserrat fixed top-0 z-50">
        #somosinfinitos
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-8 w-full z-40 transition-all duration-300 backdrop-blur-sm ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 h-16">
            <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
            <div className="font-montserrat font-bold text-xl leading-none">
              <span style={{ color: '#f6bb3f' }}>Fundación</span>{' '}
              <span style={{ color: '#e17a2d' }}>TEA</span>{' '}
              <span style={{ color: '#99b169' }}>Santa Cruz</span>
            </div>
          </Link>

          {/* Botón hamburguesa */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-tea-blue focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-montserrat text-gray-700 hover:text-tea-blue hover:font-semibold transition-all duration-300"
                scroll={link.href.startsWith('#')}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Menú mobile desplegable */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white ${
            isOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-montserrat text-gray-700 hover:text-tea-blue text-lg transition-colors duration-300"
                scroll={link.href.startsWith('#')}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

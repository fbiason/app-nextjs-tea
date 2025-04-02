'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
//import { Menu, X } from 'lucide-react';
//import { Button } from "@/components/ui/button";

const navigationLinks = [
  { name: "Nosotros", href: "/nosotros" },
  { name: "Acciones", href: "/acciones" },
  { name: "Contacto", href: "/contacto" },
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  return (
    <>
      {!isScrolled && (
        <div
          className={`w-full bg-gradient-to-r from-tea-green to-blue-500 text-white text-sm text-center py-2 font-montserrat transition-opacity duration-500 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          #somosinfinitos
        </div>
      )}

      <nav
        className={`fixed w-full z-50 transition-all duration-300 backdrop-blur-sm ${
          isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 h-16">
            <img src="/images/logo.png" alt="Logo" className="h-16 w-auto" />
            <div className="font-montserrat font-bold text-2xl text-tea-yellow leading-none">
              Fundación <span className="text-tea-orange">TEA</span>{' '}
              <span className="text-tea-green">Santa Cruz</span>
            </div>
          </Link>

          <div className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-montserrat text-gray-700 hover:text-tea-blue hover:font-semibold transition-all duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-tea-blue focus:outline-none"
              aria-label="Abrir menú"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-md transition-transform duration-300 ease-in-out transform text-xl md:text-2xl ${
            isOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-montserrat text-gray-700 hover:text-tea-blue py-2 transition-colors duration-300"
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

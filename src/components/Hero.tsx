"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from 'next/link';

const images = [
  "/images/hero-1.webp",
  "/images/hero-2.webp",
  "/images/hero-3.webp",
  "/images/hero-4.webp",
  "/images/hero-5.webp",
];

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Carrusel de imágenes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-1000 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${(100 / images.length) * currentImageIndex}%)`,
          }}
        >
          {images.map((src, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${src})`,
                width: `${100 / images.length}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Capa de oscurecimiento */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      {/* Contenido */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-montserrat leading-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,0.9)]">
            <span className="text-[#f6bb3f]">Fundación</span>{" "}
            <span className="text-[#e17a2d]">TEA</span>
            <br />
            <span className="text-[#99b169]">Santa Cruz</span>
          </h1>

          <p className="text-lg md:text-xl text-white mb-8 drop-shadow-[1px_1px_3px_rgba(0,0,0,0.8)]">
            Trabajamos por una inclusión real y efectiva de las personas con
            Trastorno del Espectro Autista en Río Gallegos, Santa Cruz.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="#nosotros" passHref>
              <Button className="bg-[#f6bb3f] hover:bg-yellow-600 text-lg text-black hover:text-white py-6 px-8 font-semibold shadow-md hover:shadow-lg">
                Conocer Más
              </Button>
            </Link>
            <Link href="/donaciones" passHref>
              <Button
                className="bg-[#165a91] hover:bg-[#1d4ed8] text-white text-lg py-6 px-8 font-semibold shadow-lg transition-colors duration-300"
              >
                Realiza una donación
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

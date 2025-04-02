"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
//import { Button } from "@/components/ui/button";

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
    }, 5000); // cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
      {/* Slider de fondo */}
      <div className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${images[currentImageIndex]}')` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-black mb-4 font-montserrat">
  <span className="text-tea-yellow">Fundación</span>{" "}
  <span className="text-tea-orange">TEA</span>{" "}<br/>
  <span className="text-tea-green">Santa Cruz</span>
</h1>
<p className="text-lg md:text-xl text-gray-100 mb-8 text-shadow-black">
  Trabajamos por una inclusión real y efectiva de las personas con Trastorno del Espectro Autista en Río Gallegos, Santa Cruz.
</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button className="bg-tea-yellow hover:bg-yellow-700 text-lg text-black hover:text-white py-6 px-8">
              Conocer Más
            </Button>
            <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-tea-blue text-lg py-6 px-8">
              Realiza una donación
            </Button>
          </div>
        </div>
      </div>

      {/* Capa de oscurecimiento para mejorar el contraste del texto */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
    </div>
  );
};

export default Hero;

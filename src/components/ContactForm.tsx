'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Button } from './ui/button';

// Formulario configurado para enviar a fund.teasantacruz@gmail.com
// usando el endpoint: https://formspree.io/f/mkgredzg

const ContactForm = () => {
  // Usando el nuevo endpoint proporcionado
  const [state, handleSubmit] = useForm('mkgredzg');

  if (state.succeeded) {
    return (
      <div className="text-center text-green-600 font-semibold mt-4">
        ¡Gracias por tu mensaje! Te responderemos pronto.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Nombre"
            required
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
        <div>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border border-gray-300 rounded-md p-2 w-full"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>
      </div>
      <div>
        <input
          id="subject"
          type="text"
          name="subject"
          placeholder="Asunto"
          required
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      <div>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Mensaje"
          required
          className="border border-gray-300 rounded-md p-2 w-full"
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </div>
      <Button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-[#99b169] hover:bg-green-600 text-white font-semibold"
      >
        Enviar Mensaje
      </Button>
    </form>
  );
};

export default ContactForm;

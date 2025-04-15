'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ShieldCheck } from 'lucide-react';



// Esquema de validación con Zod
const donationSchema = z.object({
  amount: z.string().min(1, "Selecciona o ingresa un monto"),
  frequency: z.enum(["monthly", "once"]),
  anonymous: z.boolean().optional(),
  firstName: z.string().min(2, "Nombre demasiado corto"),
  lastName: z.string().min(2, "Apellido demasiado corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Número de teléfono inválido"),
});

// Definimos el tipo basado en el esquema Zod
type DonationFormValues = z.infer<typeof donationSchema>;

const DonationForm = () => {
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string | null>("4500");
  const [customAmount, setCustomAmount] = useState("");

  // Configuramos react-hook-form con validación Zod
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: "4500",
      frequency: "monthly",
      anonymous: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

  // Función que se ejecuta con un formulario válido
  const onSubmit = async (data: DonationFormValues) => {
    setLoading(true);

    try {
      // Guardamos los datos de la donación en localStorage para recuperarlos en la página de agradecimiento
      localStorage.setItem('lastDonation', JSON.stringify(data));

      // Enviamos los datos al endpoint de donaciones
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la donación');
      }

      // Redirigimos al usuario a la página de pago de MercadoPago
      window.location.href = result.init_point;
    } catch (error) {
      console.error("Error procesando la donación:", error);
      alert("Ocurrió un error al procesar tu donación. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  // Función para manejar la selección de montos predefinidos
  const handleAmountSelection = (amount: string) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    form.setValue("amount", amount);
  };

  // Función para manejar el ingreso de monto personalizado
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {  // Solo permitimos dígitos
      setCustomAmount(value);
      setSelectedAmount(null);
      form.setValue("amount", value);
    }
  };

  const amountOptions = [
    { value: "4500", label: "$ 4.500" },
    { value: "18000", label: "$ 18.000" },
    { value: "27000", label: "$ 27.000" },
    { value: "45000", label: "$ 45.000" },
    { value: "24300", label: "$ 24.300" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Sección de monto */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[#e17a2d] uppercase tracking-wide">
            ¿CUÁNTO QUERÉS DONAR?
          </h3>

          <p className="text-sm text-gray-600">
            Los montos están expresados en Pesos Argentinos (ARS $)
          </p>

          {/* Botones de montos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {amountOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAmountSelection(option.value)}
                className={`py-2 px-4 rounded-md border font-semibold transition-all duration-200 text-sm text-center active:scale-95
          ${selectedAmount === option.value
                    ? "bg-[#f6bb3f] text-white border-[#f6bb3f]"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-[#f6bb3f]/10 hover:border-[#f6bb3f] hover:text-[#e17a2d]"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Campo para monto personalizado */}
          <div className="mt-3">
            <label
              htmlFor="customAmount"
              className="block text-sm font-medium text-[#165a91] mb-1"
            >
              Otro monto
            </label>
            <Input
              id="customAmount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Ingrese monto personalizado"
              className={`border rounded-md w-full p-2 transition-all ${selectedAmount === null
                  ? "border-[#f6bb3f] focus:ring-2 focus:ring-[#e17a2d]"
                  : "border-gray-300"
                }`}
            />
          </div>

          {/* Validación de errores */}
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm">{form.formState.errors.amount.message}</p>
          )}
        </div>
        {/* Frecuencia de donación */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#e17a2d] uppercase tracking-wide">
            ¿CON QUÉ FRECUENCIA QUERÉS DONAR?
          </h3>

          <div className="flex items-center gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="monthly"
                {...form.register("frequency")}
                checked={form.watch("frequency") === "monthly"}
                className="h-5 w-5 text-[#99b169] focus:ring-2 focus:ring-[#f6bb3f]"
              />
              <span className="text-sm font-medium text-gray-800">Mensual</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="once"
                {...form.register("frequency")}
                checked={form.watch("frequency") === "once"}
                className="h-5 w-5 text-[#99b169] focus:ring-2 focus:ring-[#f6bb3f]"
              />
              <span className="text-sm font-medium text-gray-800">Única vez</span>
            </label>
          </div>

          <div className="flex items-start space-x-3 mt-4">
            <Checkbox
              id="anonymous"
              {...form.register("anonymous")}
              className="h-5 w-5 border-gray-400 text-[#f6bb3f]"
            />
            <label
              htmlFor="anonymous"
              className="flex items-center space-x-2 text-base font-medium text-gray-700 leading-none"
            >
              <ShieldCheck size={20} className="text-[#f6bb3f]" />
              <span>Donación anónima</span>
            </label>
          </div>
        </div>


        {/* Datos personales */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">DATOS PERSONALES</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre/s</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido/s</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu número de teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


        {/* Seguridad */}
        <div className="bg-gray-50 p-4 rounded-md flex items-center space-x-3 mt-6">
          <Shield className="text-green-600 h-5 w-5" />
          <p className="text-sm text-gray-600">
            El formulario que contiene esta página es seguro. Quiere decir que la información suministrada viaja de forma encriptada a través de la ruta (SSL/TLS).
          </p>
        </div>

        {/* Botón de envío */}
        <Button
          type="submit"
          className="w-full bg-tea-blue hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Donar a Fundación TEA Santa Cruz"}
        </Button>

        <div className="text-center text-sm text-gray-500">
          <p>Esta donación se procesará a través de la plataforma segura de MercadoPago</p>
        </div>
      </form>
    </Form>
  );
};

export default DonationForm;
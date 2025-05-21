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



// Esquema condicional que valida según si es anónimo o no
const conditionalDonationSchema = z.discriminatedUnion('anonymous', [
  // Si es anónimo, solo validamos monto y frecuencia
  z.object({
    anonymous: z.literal(true),
    amount: z.string().min(1, "Selecciona o ingresa un monto"),
    frequency: z.enum(["monthly", "once"]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
  // Si no es anónimo, validamos todos los campos excepto teléfono que es opcional
  z.object({
    anonymous: z.literal(false),
    amount: z.string().min(1, "Selecciona o ingresa un monto"),
    frequency: z.enum(["monthly", "once"]),
    firstName: z.string().min(2, "Nombre demasiado corto"),
    lastName: z.string().min(2, "Apellido demasiado corto"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Número de teléfono inválido").optional(),
  }),
]);

// Definimos el tipo basado en el esquema Zod condicional
type DonationFormValues = z.infer<typeof conditionalDonationSchema>;

const DonationForm = () => {
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<string | null>("");
  const [customAmount, setCustomAmount] = useState("");
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);

  // Configuramos react-hook-form con validación Zod
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(conditionalDonationSchema),
    defaultValues: {
      amount: "",
      frequency: "once",
      anonymous: false,
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });

  // Estado local para controlar la donación anónima
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Estado para controlar si la donación es mensual
  const [isMonthly, setIsMonthly] = useState(false); // Por defecto es única vez
  
  // Manejador para el cambio en el checkbox de donación anónima
  const handleAnonymousChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    
    // Si es anónimo, forzamos a que sea donación única
    if (checked) {
      form.setValue("frequency", "once");
      setIsMonthly(false);
    }
    
    setIsAnonymous(checked);
    form.setValue("anonymous", checked);
    
    // Actualizamos la validación del formulario
    form.trigger();
  };
  
  // Manejador para el cambio en la frecuencia de donación
  const handleFrequencyChange = (frequency: "monthly" | "once") => {
    // Si cambia a mensual, no puede ser anónimo
    if (frequency === "monthly" && isAnonymous) {
      setIsAnonymous(false);
      form.setValue("anonymous", false);
    }
    
    setIsMonthly(frequency === "monthly");
    form.setValue("frequency", frequency);
    form.trigger();
  };


  // Función que se ejecuta con un formulario válido
  const onSubmit = async (data: DonationFormValues) => {
    // Verificar que el monto no sea inferior a $5.000
    if (!data.amount || parseInt(data.amount) < 5000) {
      setCustomAmountError("El monto mínimo de donación es de $5.000");
      return;
    }
    
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
    setCustomAmount(amount);
    form.setValue("amount", amount);
  };

  // Función para manejar el ingreso de monto personalizado
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {  // Solo permitimos dígitos
      setCustomAmount(value);
      setSelectedAmount(value);
      form.setValue("amount", value);
      
      // Validar que el monto no sea inferior a $5.000 si se ha ingresado algo
      if (value && parseInt(value) < 5000) {
        setCustomAmountError("El monto mínimo de donación es de $5.000");
      } else {
        setCustomAmountError(null);
      }
    }
  };

  const amountOptions = [
    { value: "5000", label: "$ 5.000" },
    { value: "10000", label: "$ 10.000" },
    { value: "20000", label: "$ 20.000" },
    { value: "30000", label: "$ 30.000" },
    { value: "50000", label: "$ 50.000" },
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

          {/* Campo para monto */}
          <div className="mt-3">
            <label
              htmlFor="customAmount"
              className="block text-sm font-medium text-[#165a91] mb-1"
            >
              Monto a donar
            </label>
            <Input
              id="customAmount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Ingrese monto"
              className="border rounded-md w-full p-2 transition-all border-[#f6bb3f] focus:ring-2 focus:ring-[#e17a2d]"
            />
          </div>

          {/* Validación de errores */}
          {form.formState.errors.amount && (
            <p className="text-red-500 text-sm">{form.formState.errors.amount.message}</p>
          )}
          {customAmountError && (
            <p className="text-red-500 text-sm">{customAmountError}</p>
          )}
        </div>
        {/* Frecuencia de donación - Solo visible si no es anónima */}
        {!isAnonymous && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-[#e17a2d] uppercase tracking-wide">
              ¿CON QUÉ FRECUENCIA QUERÉS DONAR?
            </h3>

            {form.watch("anonymous") && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-600" />
                <span>Las donaciones anónimas solo pueden realizarse por única vez</span>
              </div>
            )}

            <div className="flex justify-between space-x-4 mt-4">
              <div className="flex-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    checked={form.watch("frequency") === "monthly"}
                    onChange={() => handleFrequencyChange("monthly")}
                    className="h-4 w-4 text-[#f6bb3f] focus:ring-[#f6bb3f]"
                  />
                  <span className="text-sm font-medium text-gray-800">Mensual</span>
                </label>
              </div>
              <div className="flex-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    checked={form.watch("frequency") === "once"}
                    onChange={() => handleFrequencyChange("once")}
                    className="h-4 w-4 text-[#f6bb3f] focus:ring-[#f6bb3f]"
                  />
                  <span className="text-sm font-medium text-gray-800">Única vez</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Opción de donación anónima */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3 mt-4">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              disabled={isMonthly} /* Deshabilitamos si es mensual */
              onCheckedChange={(checked) => {
                handleAnonymousChange({ target: { checked: checked === true } } as React.ChangeEvent<HTMLInputElement>);
              }}
              className={`h-5 w-5 border-gray-400 ${isMonthly ? 'opacity-50 cursor-not-allowed' : 'text-[#f6bb3f]'}`}
            />
            <label
              htmlFor="anonymous"
              className={`flex items-center space-x-2 text-base font-medium leading-none ${isMonthly ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}
            >
              <ShieldCheck size={20} className={isMonthly ? 'text-gray-400' : 'text-[#f6bb3f]'} />
              <span>Donación anónima</span>
              {isMonthly && (
                <span className="text-xs text-gray-500 ml-2">(No disponible para donaciones mensuales)</span>
              )}
            </label>
          </div>
        </div>


        {/* Datos personales - Solo visible si no es anónima */}
        {!isAnonymous && (
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
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu número de teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          </div>
        )}


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
          className="w-full bg-gradient-to-r from-[#f6bb3f] via-[#e17a2d] to-[#99b169] hover:from-[#e17a2d] hover:to-[#f6bb3f] text-white font-bold py-3 shadow-md hover:shadow-lg transition-all"
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
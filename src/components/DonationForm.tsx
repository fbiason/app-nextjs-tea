'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreditCard, Shield } from 'lucide-react';
import { Button } from './ui/button';

// Esquema de validación con Zod
const donationSchema = z.object({
    amount: z.string().min(1, "Selecciona o ingresa un monto"),
    frequency: z.enum(["monthly", "once"]),
    automaticIncrease: z.boolean().optional(),
    firstName: z.string().min(2, "Nombre demasiado corto"),
    lastName: z.string().min(2, "Apellido demasiado corto"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Número de teléfono inválido"),
    address: z.string().optional(),
    city: z.string().min(2, "Ingresa tu ciudad"),
    province: z.string().min(2, "Ingresa tu provincia"),
    postalCode: z.string().optional(),
    country: z.string().default("Argentina"),
    documentType: z.string().optional(),
    documentNumber: z.string().optional(),
    cardNumber: z.string().min(16, "Número de tarjeta inválido").max(19),
    cardName: z.string().min(2, "Ingresa el nombre como aparece en la tarjeta"),
    cardExpiry: z.string().min(5, "Fecha inválida"),
    cardCvc: z.string().min(3, "Código inválido").max(4),
    notes: z.string().optional(),
    cardOwnership: z.boolean().optional()
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
            automaticIncrease: false,
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            province: "",
            postalCode: "",
            country: "Argentina",
            documentType: "DNI",
            documentNumber: "",
            cardNumber: "",
            cardName: "",
            cardExpiry: "",
            cardCvc: "",
            notes: "",
            cardOwnership: false
        }
    });

    // Función que se ejecuta con un formulario válido
    const onSubmit = async (data: DonationFormValues) => {
        setLoading(true);

        try {
            // Aquí implementaríamos la conexión real con la pasarela de pagos
            console.log("Datos de donación:", data);

            // Simulamos un proceso de pago
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert("¡Gracias por tu donación! Hemos procesado tu contribución con éxito.");
            form.reset();
        } catch (error) {
            console.error("Error procesando la donación:", error);
            alert("Ocurrió un error al procesar tu donación. Por favor intenta nuevamente.");
        } finally {
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
                    <h3 className="text-xl font-semibold">¿CUÁNTO QUERÉS DONAR?</h3>
                    <p className="text-sm text-gray-600">Los montos están expresados en Pesos Argentinos (ARS $)</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {amountOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleAmountSelection(option.value)}
                                className={`py-2 px-4 rounded-md border ${selectedAmount === option.value
                                        ? "bg-tea-blue text-white border-tea-blue"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-3">
                        <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Otro monto
                        </label>
                        <Input
                            id="customAmount"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            placeholder="Ingrese monto personalizado"
                            className={selectedAmount === null ? "border-tea-blue" : ""}
                        />
                    </div>

                    {form.formState.errors.amount && (
                        <p className="text-red-500 text-sm">{form.formState.errors.amount.message}</p>
                    )}
                </div>

                {/* Frecuencia de donación */}
                <div className="space-y-3">
                    <h3 className="text-xl font-semibold">¿CON QUÉ FRECUENCIA QUERÉS DONAR?</h3>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                value="monthly"
                                {...form.register("frequency")}
                                checked={form.watch("frequency") === "monthly"}
                                className="h-4 w-4 text-tea-blue"
                            />
                            <span>Mensual</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                value="once"
                                {...form.register("frequency")}
                                checked={form.watch("frequency") === "once"}
                                className="h-4 w-4 text-tea-blue"
                            />
                            <span>Única vez</span>
                        </label>
                    </div>

                    {form.watch("frequency") === "monthly" && (
                        <div className="flex items-start space-x-2 mt-4">
                            <Checkbox
                                id="automaticIncrease"
                                {...form.register("automaticIncrease")}
                            />
                            <label
                                htmlFor="automaticIncrease"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Acepto aumentar la donación un 30% cada 4 meses
                            </label>
                        </div>
                    )}
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

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu dirección" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tu ciudad" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provincia</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Tu provincia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código Postal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Código postal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>País</FormLabel>
                                    <FormControl>
                                        <Input placeholder="País" {...field} readOnly />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="documentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de documento</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DNI">DNI</SelectItem>
                                            <SelectItem value="CUIT">CUIT</SelectItem>
                                            <SelectItem value="CUIL">CUIL</SelectItem>
                                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="documentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de documento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ingresa tu número" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Datos de tarjeta */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">¿DE DÓNDE QUERÉS QUE SE DEBITE LA DONACIÓN?</h3>

                    <div className="flex justify-center space-x-4 mb-6">
                        <img src="/visa.png" alt="Visa" className="h-8" onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/80x30/eee/31a5e7?text=Visa';
                        }} />
                        <img src="/mastercard.png" alt="Mastercard" className="h-8" onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/80x30/eee/31a5e7?text=Mastercard';
                        }} />
                        <img src="/amex.png" alt="American Express" className="h-8" onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/80x30/eee/31a5e7?text=Amex';
                        }} />
                        <img src="/naranja.png" alt="Naranja" className="h-8" onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/80x30/eee/31a5e7?text=Naranja';
                        }} />
                    </div>

                    <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de la tarjeta</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="1234 5678 9012 3456"
                                            {...field}
                                            className="pl-10"
                                            maxLength={19}
                                            onChange={(e) => {
                                                // Formatear el número de tarjeta mientras se escribe
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length > 0) {
                                                    value = value.match(/.{1,4}/g)?.join(' ') || '';
                                                }
                                                field.onChange(value);
                                            }}
                                        />
                                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cardName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre en la tarjeta</FormLabel>
                                <FormControl>
                                    <Input placeholder="NOMBRE APELLIDO" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de expiración</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="MM/AA"
                                            {...field}
                                            maxLength={5}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.length > 0) {
                                                    value = value.length > 2
                                                        ? value.substring(0, 2) + '/' + value.substring(2, 4)
                                                        : value;
                                                }
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cardCvc"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código de seguridad (CVV)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123"
                                            {...field}
                                            maxLength={4}
                                            type="password"
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-start space-x-2 mt-4">
                        <Checkbox
                            id="cardOwnership"
                            {...form.register("cardOwnership")}
                        />
                        <label
                            htmlFor="cardOwnership"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            La tarjeta no pertenece a la persona que está realizando la donación
                        </label>
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
                    <p>Esta donación se procesará a través de la plataforma segura de DonarOnline, en alianza con MercadoPago</p>
                </div>
            </form>
        </Form>
    );
};

export default DonationForm;
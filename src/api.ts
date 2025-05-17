import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";
import { prisma } from "./lib/prisma";
import { logger } from "./lib/logger";
import { getTokens, saveTokens, generateAndSaveOAuthState, verifyAndConsumeOAuthState } from "./lib/tokenStorage";

// Interfaz para donaciones - Alineada con los tipos de Prisma
export interface Donation {
    id?: string;
    amount: number;
    anonymous: boolean;
    donorName?: string | null;
    donorEmail?: string | null;
    phone?: string | null;
    userId?: string | null;
    frequency: string; // En Prisma está como String, no como enum
    paymentId?: string | null;
    createdAt?: Date;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Campo adicional para manejo interno
}

// Interfaz para usuarios - Alineada con los tipos de Prisma
export interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role: 'DONOR' | 'ADMIN';
    createdAt: Date;
    donations?: Donation[];
}

// Función para obtener una instancia configurada de MercadoPago
// Esta función intentará usar primero el token almacenado en la base de datos
// y si no existe, usará el token de las variables de entorno
export async function getMercadoPagoInstance(): Promise<MercadoPagoConfig> {
    // Intentamos obtener los tokens almacenados
    const storedTokens = await getTokens();
    
    if (storedTokens?.accessToken) {
        logger.debug('API', 'Usando token almacenado en base de datos para MercadoPago');
        return new MercadoPagoConfig({ accessToken: storedTokens.accessToken });
    }
    
    // Si no hay tokens almacenados, usamos el de las variables de entorno
    logger.debug('API', 'Usando token de variables de entorno para MercadoPago');
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

// Comisión de la plataforma (si aplica)
const platformCommission = process.env.MP_PLATFORM_COMMISSION 
    ? parseFloat(process.env.MP_PLATFORM_COMMISSION) 
    : 0;

const api = {
    // Operaciones relacionadas con donaciones
    donations: {
        // Obtener todas las donaciones
        async list(): Promise<Donation[]> {
            try {
                const donations = await prisma.donation.findMany({
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                
                return donations;
            } catch (error) {
                logger.error('API_DONATIONS_LIST', 'Error al obtener las donaciones', { error });
                throw error;
            }
        },

        // Crear una nueva donación
        async create(donation: Omit<Donation, 'id' | 'createdAt' | 'status'>): Promise<Donation> {
            try {
                // Creamos la donación usando Prisma
                // El campo createdAt se establece automáticamente con @default(now()) en Prisma
                const newDonation = await prisma.donation.create({
                    data: {
                        amount: donation.amount,
                        anonymous: donation.anonymous,
                        donorName: donation.donorName,
                        donorEmail: donation.donorEmail,
                        phone: donation.phone,
                        frequency: donation.frequency,
                        paymentId: donation.paymentId,
                        userId: donation.userId
                    }
                });
                
                logger.info('API_DONATIONS_CREATE', 'Donación creada exitosamente', { 
                    donationId: newDonation.id,
                    amount: newDonation.amount 
                });
                
                return newDonation;
            } catch (error) {
                logger.error('API_DONATIONS_CREATE', 'Error al crear la donación', { 
                    error,
                    donation: { ...donation, amount: donation.amount }
                });
                throw error;
            }
        },

        // Obtener una donación por ID
        async getById(id: string): Promise<Donation | null> {
            try {
                const donation = await prisma.donation.findUnique({
                    where: { id }
                });
                
                return donation;
            } catch (error) {
                logger.error('API_DONATIONS_GET', `Error al obtener la donación ${id}`, { error });
                throw error;
            }
        },
        
        // Obtener una donación por ID de pago
        async getByPaymentId(paymentId: string): Promise<Donation | null> {
            try {
                const donation = await prisma.donation.findUnique({
                    where: { paymentId }
                });
                
                return donation;
            } catch (error) {
                logger.error('API_DONATIONS_GET_BY_PAYMENT', `Error al obtener la donación con paymentId ${paymentId}`, { error });
                throw error;
            }
        },

        // Actualizar el estado de pago de una donación
        async updatePaymentStatus(donationId: string, paymentId: string, status: Donation['status']): Promise<void> {
            try {
                // Nota: El campo status no existe en la definición del modelo Prisma
                // Solo actualizamos el paymentId que sí existe en la tabla
                await prisma.donation.update({
                    where: { id: donationId },
                    data: { paymentId }
                });
                
                logger.info('API_DONATIONS_UPDATE_STATUS', 'Estado de pago actualizado', {
                    donationId,
                    paymentId,
                    status: status || 'unknown' // Para logging interno
                });
            } catch (error) {
                logger.error('API_DONATIONS_UPDATE_STATUS', 'Error al actualizar el estado de pago', {
                    error,
                    donationId,
                    paymentId,
                    status
                });
                throw error;
            }
        }
    },

    // Operaciones relacionadas con la autenticación de MercadoPago
    mercadopago: {
        // Generar URL de autorización con estado para evitar CSRF
        async authorize(): Promise<string> {
            try {
                logger.info('API_MP_AUTHORIZE', 'Generando URL de autorización');
                
                // Verificamos que las variables de entorno estén configuradas
                if (!process.env.NEXT_PUBLIC_MP_CLIENT_ID) {
                    throw new Error("Client ID de MercadoPago no configurado");
                }
                
                if (!process.env.APP_URL) {
                    throw new Error("URL de la aplicación no configurada");
                }
                
                // Generamos un estado y lo guardamos en la base de datos usando nuestro sistema seguro
                const state = await generateAndSaveOAuthState();
                
                logger.info('API_MP_AUTHORIZE', 'Estado OAuth generado y almacenado para verificación CSRF', { 
                    statePreview: state.substring(0, 8) + '...' 
                });
                
                // Construimos la URL de autorización
                const redirectUri = `${process.env.APP_URL}/api/mercadopago/connect`;
                
                // Generamos la URL de autorización
                const url = `https://auth.mercadopago.com.ar/authorization?client_id=${process.env.NEXT_PUBLIC_MP_CLIENT_ID}&response_type=code&platform_id=mp&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
                
                logger.info('API_MP_AUTHORIZE', 'URL de autorización generada', { redirectUri });
                
                return url;
            } catch (error) {
                logger.error('API_MP_AUTHORIZE', 'Error al autorizar MercadoPago', { error });
                throw error;
            }
        },

        // Conectar con MercadoPago usando el código de autorización
        async connect(code: string, state: string) {
            try {
                logger.info('API_MP_CONNECT', 'Iniciando conexión con MercadoPago', { code: code ? '***' : 'no code' });
                
                // Verificar el estado OAuth para prevenir ataques CSRF
                const isValidState = await verifyAndConsumeOAuthState(state);
                if (!isValidState) {
                    logger.error('API_MP_CONNECT', 'Estado OAuth inválido', { statePreview: state.substring(0, 8) + '...' });
                    throw new Error("Estado de autorización inválido o expirado");
                }
                
                logger.info('API_MP_CONNECT', 'Estado OAuth verificado correctamente');

                if (!code) {
                    throw new Error('No se proporcionó el código de autorización');
                }

                // Verificamos que tengamos las variables de entorno necesarias
                const requiredEnvVars = {
                    'NEXT_PUBLIC_MP_CLIENT_ID': process.env.NEXT_PUBLIC_MP_CLIENT_ID,
                    'MP_CLIENT_SECRET': process.env.MP_CLIENT_SECRET,
                    'APP_URL': process.env.APP_URL
                };

                const missingVars = Object.entries(requiredEnvVars)
                    .filter(([, value]) => !value)
                    .map(([key]) => key);

                if (missingVars.length > 0) {
                    throw new Error(`Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
                }

                const redirectUri = `${process.env.APP_URL}/api/mercadopago/connect`;

                logger.info('API_MP_CONNECT', 'Intercambiando código por token', {
                    clientId: process.env.NEXT_PUBLIC_MP_CLIENT_ID ? '***' : 'no definido',
                    redirectUri,
                    codeLength: code.length
                });

                // Obtenemos una instancia de MercadoPago con el token de acceso
                const mpInstance = await getMercadoPagoInstance();
                
                // Intercambiamos el código por el token de acceso
                const credentials = await new OAuth(mpInstance).create({
                    body: {
                        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
                        client_secret: process.env.MP_CLIENT_SECRET!,
                        code,
                        redirect_uri: redirectUri,
                    },
                });

                logger.info('API_MP_CONNECT', 'Conexión exitosa con MercadoPago', {
                    userId: credentials.user_id,
                    refreshToken: credentials.refresh_token ? '***' : 'no disponible',
                    publicKey: credentials.public_key ? '***' : 'no disponible'
                });
                
                // Verificar que tenemos un token de acceso válido
                if (!credentials.access_token) {
                    throw new Error('No se recibió un token de acceso válido de MercadoPago');
                }
                
                // Guardar los tokens en el almacenamiento seguro
                await saveTokens({
                    accessToken: credentials.access_token, // Ahora sabemos que no es undefined
                    refreshToken: credentials.refresh_token,
                    userId: credentials.user_id ? credentials.user_id.toString() : undefined,
                    publicKey: credentials.public_key,
                    expiresAt: credentials.expires_in 
                        ? new Date(Date.now() + credentials.expires_in * 1000)
                        : undefined
                });
                
                logger.info('API_MP_CONNECT', 'Tokens almacenados en la base de datos');

                return credentials;
            } catch (error) {
                if (error instanceof Error) {
                    logger.error('API_MP_CONNECT', `Error al conectar con MercadoPago: ${error.message}`, {
                        error: error.stack,
                        codePreview: code ? code.substring(0, 4) + '...' : 'no code',
                        statePreview: state ? state.substring(0, 8) + '...' : 'no state'
                    });
                } else {
                    logger.error('API_MP_CONNECT', `Error desconocido: ${String(error)}`);
                }

                throw error;
            }
        },

        // Crear una preferencia de pago
        async createPreference(amount: number, frequency: 'one-time' | 'monthly', userData: { name?: string; email?: string; phone?: string } = {}) {
            try {
                // Obtenemos una instancia de MercadoPago con el token de acceso
                const mpInstance = await getMercadoPagoInstance();
                
                const preference = new Preference(mpInstance);

                // Creamos la preferencia de pago
                const result = await preference.create({
                    body: {
                        items: [
                            {
                                id: `donation-${Date.now()}`, // Agregamos un ID único para el item
                                title: `Donación ${frequency === 'monthly' ? 'mensual' : 'única'}`,
                                quantity: 1,
                                unit_price: amount,
                                currency_id: 'ARS',
                            },
                        ],
                        // Agregamos la comisión de la plataforma si está configurada
                        marketplace_fee: platformCommission > 0 ? (amount * platformCommission / 100) : undefined,
                        payer: {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone ? { number: userData.phone } : undefined,
                        },
                        back_urls: {
                            success: `${process.env.APP_URL}/donaciones/gracias`,
                            pending: `${process.env.APP_URL}/donaciones/pendiente`,
                            failure: `${process.env.APP_URL}/donaciones`, // Redirigimos a la página principal de donaciones en caso de error
                        },
                        auto_return: 'approved',
                        notification_url: `${process.env.APP_URL}/api/donations/webhook`,
                        statement_descriptor: 'DONACION TEA',
                        external_reference: JSON.stringify({
                            type: 'donation',
                            frequency,
                        }),
                    },
                });

                logger.info('API_MP_CREATE_PREFERENCE', 'Preferencia de pago creada', {
                    preferenceId: result.id,
                    amount,
                    frequency
                });

                return result;
            } catch (error) {
                logger.error('API_MP_CREATE_PREFERENCE', 'Error al crear la preferencia de pago', {
                    error,
                    amount,
                    frequency
                });
                throw error;
            }
        }
    }
};

export default api;

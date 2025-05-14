import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";
import { supabase } from "./lib/supabase";
// Eliminamos cualquier referencia a Prisma para evitar problemas con creación de directorios

interface Message {
    id: number;
    text: string;
}

interface User {
    id: number;
    name: string;
    marketplace: string | null;
}

export const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

const api = {
    user: {
        async fetch(): Promise<User> {
            try {
                // Comprobamos si existe un token de marketplace almacenado en localStorage o environment
                let marketplaceToken = null;
                
                // Intentamos obtener el token desde una variable de entorno
                if (process.env.MP_MARKETPLACE_TOKEN) {
                    marketplaceToken = process.env.MP_MARKETPLACE_TOKEN;
                }
                
                // Devolvemos un usuario con el token si existe
                return {
                    id: 1,
                    name: "Admin",
                    marketplace: marketplaceToken
                };
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
                
                // En caso de error, devolvemos un usuario por defecto sin token
                return {
                    id: 1,
                    name: "Admin",
                    marketplace: null
                };
            }
        },
        async update(data: Partial<User>): Promise<void> {
            try {
                // En entorno de producción, no hacemos nada ya que no guardamos en la base de datos
                // Solo registramos lo que se intentó guardar para debugging
                console.log("Actualizando datos de usuario:", data);
                
                // Si hay datos de marketplace, podríamos guardarlos en una variable de entorno
                // o en otro almacenamiento persistente según necesidades
                if (data.marketplace) {
                    console.log("Nuevo token de marketplace recibido");
                    // En un entorno real, aquí guardaríamos el token en algún lugar seguro
                }
            } catch (error) {
                console.error("Error al procesar la actualización:", error);
            }
        },
        async authorize() {
            // Obtenemos la url de autorización
            const url = new OAuth(mercadopago).getAuthorizationURL({
                options: {
                    client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
                    redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
                },
            });

            // Devolvemos la url
            return url;
        },
        async connect(code: string) {
            try {
                // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
                const credentials = await new OAuth(mercadopago).create({
                    body: {
                        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
                        client_secret: process.env.MP_CLIENT_SECRET,
                        code,
                        redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
                    },
                });

                // En lugar de guardar en la base de datos, solo loggeamos el token para configurarlo manualmente
                if (credentials.access_token) {
                    console.log('======================================================');
                    console.log('TOKEN DE MARKETPLACE OBTENIDO EXITOSAMENTE');
                    console.log('Añade esta variable a tu archivo .env:');
                    console.log(`MP_MARKETPLACE_TOKEN=${credentials.access_token}`);
                    console.log('======================================================');
                }

                // Devolvemos las credenciales
                return credentials;
            } catch (error) {
                console.error("Error al conectar con MercadoPago:", error);
                throw error;
            }
        },
    },
    message: {
        async list(): Promise<Message[]> {
            try {
                // Obtenemos los mensajes desde Supabase
                const { data, error } = await supabase
                    .from('tea_messages')
                    .select('*')
                    .order('created_at', { ascending: false });
                    
                if (error) throw error;
                
                // Devolvemos los mensajes
                return data as Message[] || [];
            } catch (error) {
                console.error("Error al obtener los mensajes:", error);
                return [];
            }
        },
        async add(message: Message): Promise<void> {
            try {
                // Verificamos si ya existe un mensaje con ese id
                const { data, error: checkError } = await supabase
                    .from('tea_messages')
                    .select('id')
                    .eq('id', message.id);
                    
                if (checkError) throw checkError;
                
                // Si ya existe un mensaje con ese id, lanzamos un error
                if (data && data.length > 0) {
                    throw new Error("Message already added");
                }
                
                // Insertamos el nuevo mensaje
                const { error } = await supabase
                    .from('tea_messages')
                    .insert(message);
                    
                if (error) throw error;
            } catch (error) {
                console.error("Error al agregar el mensaje:", error);
                throw error;
            }
        },
        async submit(text: Message["text"], marketplace: string) {
            // Creamos el cliente de Mercado Pago usando el access token del Marketplace
            const client: MercadoPagoConfig = new MercadoPagoConfig({ accessToken: marketplace });

            // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
            const preference = await new Preference(client).create({
                body: {
                    items: [
                        {
                            id: "message",
                            unit_price: 100,
                            quantity: 1,
                            title: "Mensaje de muro",
                        },
                    ],
                    metadata: {
                        text,
                    },
                    // Le agregamos ARS 5 de comisión
                    marketplace_fee: 5,
                },
            });

            // Devolvemos el init point (url de pago) para que el usuario pueda pagar
            return preference.init_point!;
        },
    },
};

export default api;

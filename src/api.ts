import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";
import { supabase } from "./lib/supabase";

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
                // Obtenemos el usuario desde Supabase
                const { data, error } = await supabase
                    .from('tea_users')
                    .select('*')
                    .eq('id', 1)
                    .single();
                
                if (error) throw error;
                
                // Si existe el usuario, lo devolvemos
                if (data) {
                    return data as User;
                }
                
                // Si no existe, creamos uno por defecto
                const defaultUser: User = {
                    id: 1,
                    name: "Admin",
                    marketplace: null
                };
                
                // Insertamos el usuario por defecto
                const { error: insertError } = await supabase
                    .from('tea_users')
                    .insert(defaultUser);
                    
                if (insertError) throw insertError;
                
                return defaultUser;
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
                
                // En caso de error, devolvemos un usuario por defecto
                return {
                    id: 1,
                    name: "Admin",
                    marketplace: null
                };
            }
        },
        async update(data: Partial<User>): Promise<void> {
            try {
                // Actualizamos el usuario en Supabase
                const { error } = await supabase
                    .from('tea_users')
                    .update(data)
                    .eq('id', 1);
                    
                if (error) throw error;
            } catch (error) {
                console.error("Error al actualizar el usuario:", error);
                throw error;
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
            // Obtenemos las credenciales del usuario usando el code que obtuvimos de oauth
            const credentials = await new OAuth(mercadopago).create({
                body: {
                    client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID,
                    client_secret: process.env.MP_CLIENT_SECRET,
                    code,
                    redirect_uri: `${process.env.APP_URL}/api/mercadopago/connect`,
                },
            });

            // Actualizamos automáticamente el usuario con el token de marketplace
            // Esto asegura que solo haya una única cuenta vinculada a MercadoPago
            if (credentials.access_token) {
                await api.user.update({
                    marketplace: credentials.access_token
                });
            }

            // Devolvemos las credenciales
            return credentials;
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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { MercadoPagoConfig, Preference, OAuth } from "mercadopago";

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
            const dbPath = "db/user.db";
            
            // Verificamos si el directorio existe, si no, lo creamos
            const dir = dirname(dbPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            
            // Verificamos si el archivo existe
            if (!existsSync(dbPath)) {
                // Si no existe, creamos un archivo con datos por defecto
                // Importante: solo debe haber un único usuario administrador
                const defaultUser: User = {
                    id: 1,
                    name: "Admin",
                    marketplace: null
                };
                writeFileSync(dbPath, JSON.stringify(defaultUser, null, 2));
                return defaultUser;
            }
            
            // Leemos el archivo de la base de datos del usuario
            const db = readFileSync(dbPath);

            try {
                // Devolvemos los datos como un objeto
                return JSON.parse(db.toString());
            } catch (error) {
                // Si hay un error al parsear el JSON, creamos un nuevo archivo con datos por defecto
                console.error("Error al parsear el archivo de usuario, creando uno nuevo:", error);
                const defaultUser: User = {
                    id: 1,
                    name: "Admin",
                    marketplace: null
                };
                writeFileSync(dbPath, JSON.stringify(defaultUser, null, 2));
                return defaultUser;
            }
        },
        async update(data: Partial<User>): Promise<void> {
            // Obtenemos los datos del usuario
            const db = await api.user.fetch();

            // Extendemos los datos con los nuevos datos
            const draft = { ...db, ...data };

            // Guardamos los datos
            writeFileSync("db/user.db", JSON.stringify(draft, null, 2));
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
            const dbPath = "db/message.db";
            
            // Verificamos si el directorio existe, si no, lo creamos
            const dir = dirname(dbPath);
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
            
            // Verificamos si el archivo existe
            if (!existsSync(dbPath)) {
                // Si no existe, creamos un archivo con un array vacío
                writeFileSync(dbPath, JSON.stringify([], null, 2));
                return [];
            }
            
            // Leemos el archivo de la base de datos de los mensajes
            const db = readFileSync(dbPath);

            // Devolvemos los datos como un array de objetos
            return JSON.parse(db.toString());
        },
        async add(message: Message): Promise<void> {
            // Obtenemos los mensajes
            const db = await api.message.list();

            // Si ya existe un mensaje con ese id, lanzamos un error
            if (db.some((_message) => _message.id === message.id)) {
                throw new Error("Message already added");
            }

            // Agregamos el nuevo mensaje
            const draft = db.concat(message);

            // Guardamos los datos
            writeFileSync("db/message.db", JSON.stringify(draft, null, 2));
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

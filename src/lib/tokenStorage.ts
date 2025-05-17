/**
 * Sistema seguro de almacenamiento de tokens para MercadoPago
 * Implementa mejores prácticas para almacenar y gestionar tokens de acceso
 */

import { prisma } from "./prisma";
import { logger } from "./logger";
import { randomBytes, createHash } from 'crypto';

// Interfaces
export interface MPTokenData {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  publicKey?: string;
  expiresAt?: Date;
}

/**
 * Genera un estado OAuth aleatorio seguro basado en bytes aleatorios
 * @returns Estado aleatorio seguro en formato Base64URL
 */
export function generateSecureState(): string {
  // Generamos 32 bytes (256 bits) de datos aleatorios seguros
  const randomState = randomBytes(32);
  
  // Convertimos a Base64URL (Base64 seguro para URLs)
  return randomState.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
}

/**
 * Guarda de forma segura los tokens de MercadoPago en la base de datos
 * En un entorno de producción real, considera usar AWS Secrets Manager, HashiCorp Vault o similar
 */
export async function saveTokens(tokenData: MPTokenData): Promise<void> {
  try {
    // Verificamos si ya existe una entrada para tokens de MP
    const existingToken = await prisma.keyValueStore.findFirst({
      where: { key: 'mp_credentials' }
    });

    // Generamos un IV (Initialization Vector) único para la encriptación
    const iv = randomBytes(16).toString('hex');
    
    // Preparamos los datos a guardar, incluyendo cuándo expira
    const dataToStore = {
      ...tokenData,
      // Añadimos la fecha de expiración (MercadoPago tokens typically expire in 6 months)
      expiresAt: tokenData.expiresAt || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      // Añadimos información de cuándo se actualizó
      updatedAt: new Date(),
      // Añadimos el vector de inicialización
      iv
    };

    if (existingToken) {
      // Actualizamos el token existente
      await prisma.keyValueStore.update({
        where: { id: existingToken.id },
        data: { 
          value: JSON.stringify(dataToStore),
          updatedAt: new Date()
        }
      });
      logger.info('TOKEN_STORAGE', '🔄 Tokens de MercadoPago actualizados en almacenamiento seguro');
    } else {
      // Creamos un nuevo registro
      await prisma.keyValueStore.create({
        data: {
          key: 'mp_credentials',
          value: JSON.stringify(dataToStore),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logger.info('TOKEN_STORAGE', '✅ Tokens de MercadoPago guardados en almacenamiento seguro');
    }
  } catch (error) {
    logger.error('TOKEN_STORAGE', '❌ Error al guardar tokens de MercadoPago', { error });
    throw new Error('No se pudieron guardar los tokens de MercadoPago');
  }
}

/**
 * Recupera los tokens de MercadoPago de la base de datos
 */
export async function getTokens(): Promise<MPTokenData | null> {
  try {
    const storedData = await prisma.keyValueStore.findFirst({
      where: { key: 'mp_credentials' }
    });

    if (!storedData?.value) {
      logger.warning('TOKEN_STORAGE', '⚠️ No se encontraron tokens de MercadoPago');
      return null;
    }

    const parsedData = JSON.parse(storedData.value) as MPTokenData & {
      expiresAt?: string;
      updatedAt?: string;
      iv?: string;
    };

    // Convertimos las cadenas de fecha a objetos Date
    if (parsedData.expiresAt) {
      parsedData.expiresAt = new Date(parsedData.expiresAt);
    }

    // Verificamos si el token ha expirado
    if (parsedData.expiresAt && parsedData.expiresAt < new Date()) {
      logger.warning('TOKEN_STORAGE', '⚠️ Token de MercadoPago expirado, se debe renovar');
    }

    // Retornamos solo los datos relevantes de token
    return {
      accessToken: parsedData.accessToken,
      refreshToken: parsedData.refreshToken,
      userId: parsedData.userId,
      publicKey: parsedData.publicKey,
      expiresAt: parsedData.expiresAt instanceof Date ? parsedData.expiresAt : undefined
    };
  } catch (error) {
    logger.error('TOKEN_STORAGE', '❌ Error al recuperar tokens de MercadoPago', { error });
    throw new Error('No se pudieron recuperar los tokens de MercadoPago');
  }
}

/**
 * Genera un estado único para el flujo OAuth y lo guarda
 */
export async function generateAndSaveOAuthState(): Promise<string> {
  try {
    // Generamos un identificador único
    const state = randomBytes(32).toString('hex');
    
    // Guardamos el estado con una marca de tiempo para expiración
    await prisma.keyValueStore.create({
      data: {
        key: `oauth_state_${state}`,
        value: JSON.stringify({ 
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos de validez
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    logger.info('TOKEN_STORAGE', '✅ Estado OAuth generado y almacenado', { 
      statePreview: state.substring(0, 8) 
    });
    
    return state;
  } catch (error) {
    logger.error('TOKEN_STORAGE', '❌ Error al generar estado OAuth', { error });
    throw new Error('No se pudo generar el estado OAuth');
  }
}

/**
 * Verifica un estado OAuth recibido y lo elimina si es válido
 */
export async function verifyAndConsumeOAuthState(state: string): Promise<boolean> {
  try {
    // Buscamos el estado en la base de datos
    const storedState = await prisma.keyValueStore.findFirst({
      where: { key: `oauth_state_${state}` }
    });
    
    if (!storedState) {
      logger.warning('TOKEN_STORAGE', '⚠️ Estado OAuth no encontrado', { 
        statePreview: state.substring(0, 8) 
      });
      return false;
    }
    
    // Parseamos los datos almacenados
    const stateData = JSON.parse(storedState.value) as {
      createdAt: string;
      expiresAt: string;
    };
    
    // Verificamos si el estado ha expirado
    const expiresAt = new Date(stateData.expiresAt);
    if (expiresAt < new Date()) {
      logger.warning('TOKEN_STORAGE', '⚠️ Estado OAuth expirado', {
        statePreview: state.substring(0, 8),
        expiresAt
      });
      
      // Eliminamos el estado expirado
      await prisma.keyValueStore.delete({
        where: { id: storedState.id }
      });
      
      return false;
    }
    
    // Eliminamos el estado usado para evitar reutilización
    await prisma.keyValueStore.delete({
      where: { id: storedState.id }
    });
    
    logger.info('TOKEN_STORAGE', '✅ Estado OAuth verificado y consumido', {
      statePreview: state.substring(0, 8)
    });
    
    return true;
  } catch (error) {
    logger.error('TOKEN_STORAGE', '❌ Error al verificar estado OAuth', { error });
    return false;
  }
}

/**
 * Verifica la firma de un webhook de MercadoPago
 * Según la documentación: https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
export function verifyWebhookSignature(
  requestSignature: string | null,
  requestData: string,
  timestamp: string | null
): boolean {
  if (!requestSignature || !timestamp) {
    logger.warning('WEBHOOK_SIGNATURE', '⚠️ Falta firma o timestamp en la solicitud');
    return false;
  }
  
  try {
    // El formato de la firma es ts=TIMESTAMP,v1=HASH
    const signatureParts = requestSignature.split(',');
    const signatureTimestamp = signatureParts[0].split('=')[1];
    const signatureHash = signatureParts[1].split('=')[1];
    
    // Verificamos que el timestamp coincida
    if (signatureTimestamp !== timestamp) {
      logger.warning('WEBHOOK_SIGNATURE', '⚠️ Timestamp no coincide', {
        signatureTimestamp,
        requestTimestamp: timestamp
      });
      return false;
    }
    
    // Calculamos el hash esperado
    // Para webhooks de MercadoPago, el string a hashear es: TIMESTAMP + . + PAYLOAD
    const dataToHash = signatureTimestamp + '.' + requestData;
    const calculatedHash = createHash('sha256')
      .update(dataToHash)
      .update(process.env.MP_WEBHOOK_SECRET || '')
      .digest('hex');
    
    // Comparamos el hash calculado con el recibido
    const isValid = calculatedHash === signatureHash;
    
    if (!isValid) {
      logger.warning('WEBHOOK_SIGNATURE', '⚠️ Firma no válida', {
        expectedHash: calculatedHash.substring(0, 10) + '...',
        receivedHash: signatureHash.substring(0, 10) + '...'
      });
    } else {
      logger.info('WEBHOOK_SIGNATURE', '✅ Firma verificada correctamente');
    }
    
    return isValid;
  } catch (error) {
    logger.error('WEBHOOK_SIGNATURE', '❌ Error al verificar firma', { error });
    return false;
  }
}

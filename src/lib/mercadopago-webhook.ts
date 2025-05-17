/**
 * Utilidades para verificar la firma de los webhooks de MercadoPago
 * Basado en la documentación oficial: 
 * https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */

import { createHmac } from 'crypto';
import { logger } from './logger';

/**
 * Interfaces para las diferentes estructuras de notificaciones de MercadoPago
 */

// Estructura base para las notificaciones de MercadoPago
interface MercadoPagoWebhookBase {
  id?: number;
  live_mode?: boolean;
  type?: string;
  date_created?: string;
  user_id?: number;
  api_version?: string;
  action?: string;
}

// Notificación con data.id (formato común)
interface MercadoPagoWebhookWithData extends MercadoPagoWebhookBase {
  data: {
    id: string;
  };
}

// Notificación con resource (otro formato común)
interface MercadoPagoWebhookWithResource extends MercadoPagoWebhookBase {
  resource: string;
  topic?: string;
}

// Notificación de pago recurrente de suscripción
interface MercadoPagoWebhookWithPreapprovalPayment extends MercadoPagoWebhookBase {
  preapproval_id: string;
}

// Notificación de chargebacks
interface MercadoPagoWebhookWithChargebacks extends MercadoPagoWebhookBase {
  chargebacks_id: string;
}

// Notificación de Point
interface MercadoPagoWebhookWithPointIntegration extends MercadoPagoWebhookBase {
  point_integration_id: string;
}

// Tipo unión que representa todos los posibles formatos
type MercadoPagoWebhookNotification = 
  | MercadoPagoWebhookWithData 
  | MercadoPagoWebhookWithResource
  | MercadoPagoWebhookWithPreapprovalPayment
  | MercadoPagoWebhookWithChargebacks
  | MercadoPagoWebhookWithPointIntegration;

/**
 * Interfaz para los parámetros de consulta que pueden contener el ID
 */
interface QueryParams {
  'data.id'?: string;
  id?: string;
  [key: string]: string | undefined;
}

/**
 * Verifica la autenticidad de una notificación webhook de MercadoPago
 * @param body El cuerpo de la solicitud, puede ser un string JSON o un objeto ya parseado
 * @param headers Los headers de la solicitud
 * @param queryParams Parámetros de consulta de la URL (opcional)
 * @returns true si la firma es válida, false en caso contrario
 */
export function verifyMercadoPagoSignature(
  body: string | object,
  headers: Headers,
  queryParams?: QueryParams
): boolean {
  try {
    // Obtener el header x-signature
    const signature = headers.get('x-signature');
    if (!signature) {
      logger.warning('WEBHOOK_VERIFY', 'No se encontró el header x-signature');
      return false;
    }

    // Extraer timestamp y hash
    const parts = signature.split(',');
    let timestamp = '';
    let receivedHash = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 'ts') timestamp = value;
      if (key === 'v1') receivedHash = value;
    }

    if (!timestamp || !receivedHash) {
      logger.warning('WEBHOOK_VERIFY', 'Formato de signature inválido', { signature });
      return false;
    }

    // Obtener el requestId del header
    const requestId = headers.get('x-request-id') || '';

    // Obtener el dataId del body o de los parámetros de consulta
    let dataId = '';
    let parsedBody: MercadoPagoWebhookNotification;
    
    if (typeof body === 'string') {
      try {
        parsedBody = JSON.parse(body) as MercadoPagoWebhookNotification;
      } catch (e) {
        logger.error('WEBHOOK_VERIFY', 'Error al parsear el body', { error: e });
        return false;
      }
    } else {
      parsedBody = body as MercadoPagoWebhookNotification;
    }
    
    // Orden de prioridad para obtener el ID según la documentación:
    
    // 1. Primero revisar si viene en los parámetros de consulta
    if (queryParams) {
      if (queryParams['data.id']) {
        dataId = queryParams['data.id'];
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en query param data.id', { dataId });
      } else if (queryParams.id) {
        dataId = queryParams.id;
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en query param id', { dataId });
      }
    }
    
    // 2. Si no está en los parámetros, buscarlo en el cuerpo según el formato
    if (!dataId) {
      // Verificar si es una notificación con data.id (payment, merchant_order, etc)
      if ('data' in parsedBody && parsedBody.data && parsedBody.data.id) {
        dataId = parsedBody.data.id;
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en data.id del cuerpo', { dataId });
      } 
      // Verificar si es una notificación con resource (webhook típico)
      else if ('resource' in parsedBody && typeof parsedBody.resource === 'string') {
        // Extraer el ID si es una URL o usar directamente si es un ID
        if (parsedBody.resource.startsWith('http')) {
          try {
            const resourceUrl = new URL(parsedBody.resource);
            const pathParts = resourceUrl.pathname.split('/');
            const potentialId = pathParts[pathParts.length - 1]; // último segmento de la URL
            if (potentialId && /^[0-9]+$/.test(potentialId)) {
              dataId = potentialId;
              logger.debug('WEBHOOK_VERIFY', 'ID extraído de resource URL', { dataId });
            }
          } catch (error) {
            logger.warning('WEBHOOK_VERIFY', 'No se pudo extraer ID de la URL de resource', { resource: parsedBody.resource, error });
          }
        } else {
          // Si no es URL, usar directamente como ID
          dataId = parsedBody.resource;
          logger.debug('WEBHOOK_VERIFY', 'ID encontrado en resource del cuerpo', { dataId });
        }
      }
      // Verificar otros tipos de notificaciones
      else if ('preapproval_id' in parsedBody && parsedBody.preapproval_id) {
        dataId = parsedBody.preapproval_id;
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en preapproval_id', { dataId });
      }
      else if ('chargebacks_id' in parsedBody && parsedBody.chargebacks_id) {
        dataId = parsedBody.chargebacks_id;
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en chargebacks_id', { dataId });
      }
      else if ('point_integration_id' in parsedBody && parsedBody.point_integration_id) {
        dataId = parsedBody.point_integration_id;
        logger.debug('WEBHOOK_VERIFY', 'ID encontrado en point_integration_id', { dataId });
      }
    }

    // Si el dataId es alfanumérico, convertir a minúsculas según la documentación
    if (dataId && /^[a-zA-Z0-9]+$/.test(dataId)) {
      dataId = dataId.toLowerCase();
      logger.debug('WEBHOOK_VERIFY', 'ID alfanumérico convertido a minúsculas', { dataId });
    }

    // Construir el template según la documentación
    let template = '';
    
    if (dataId) {
      template += `id:${dataId};`;
    }
    
    if (requestId) {
      template += `request-id:${requestId};`;
    }
    
    template += `ts:${timestamp};`;
    
    logger.debug('WEBHOOK_VERIFY', 'Template generado para verificación', { template });

    // Obtener la clave secreta de las variables de entorno
    const secretKey = process.env.MP_WEBHOOK_SECRET;
    if (!secretKey) {
      logger.error('WEBHOOK_VERIFY', 'MP_WEBHOOK_SECRET no está configurado');
      return false;
    }
    
    // Mostrar los primeros 4 caracteres de la clave en debug (seguridad)
    logger.debug('WEBHOOK_VERIFY', 'Usando clave secreta', { 
      keyPreview: secretKey.substring(0, 4) + '...' 
    });

    // Calcular el hash HMAC-SHA256
    const calculatedHash = createHmac('sha256', secretKey)
      .update(template)
      .digest('hex');

    // Comparar los hashes
    const isValid = calculatedHash === receivedHash;
    
    if (!isValid) {
      logger.warning('WEBHOOK_VERIFY', '❌ La firma no es válida', {
        calculatedHashPreview: calculatedHash.substring(0, 10) + '...',
        receivedHashPreview: receivedHash.substring(0, 10) + '...',
        template,
        topic: ('topic' in parsedBody) ? parsedBody.topic : undefined,
        type: parsedBody.type,
        action: parsedBody.action
      });
    } else {
      logger.info('WEBHOOK_VERIFY', '✅ Firma de MercadoPago verificada correctamente', {
        topic: ('topic' in parsedBody) ? parsedBody.topic : undefined,
        type: parsedBody.type,
        action: parsedBody.action
      });
    }

    return isValid;
  } catch (error) {
    logger.error('WEBHOOK_VERIFY', 'Error al verificar la firma', { error });
    return false;
  }
}

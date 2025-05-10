import { Resend } from 'resend';

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Correos de los administradores
const ADMIN_EMAILS = ['mauro.venticinque@hotmail.com', 'franco.biason@gmail.com'];

// Porcentaje de comisión de la plataforma (5%)
const PLATFORM_COMMISSION = parseFloat(process.env.MP_PLATFORM_COMMISSION || '0.05');

/**
 * Envía un correo electrónico a los administradores cuando se realiza una donación exitosa
 * @param donationData Datos de la donación
 */
// Definir una interfaz para los datos de donación
interface DonationData {
  id: string;
  amount: number;
  donorName?: string | null;
  donorEmail?: string | null;
  anonymous?: boolean;
  paymentId?: string | null;
  createdAt: Date;
  frequency?: string;
  userId?: string | null;
  phone?: string | null;
}

export async function sendDonationNotificationToAdmins(donationData: DonationData) {
  try {
    // Calcular la comisión total
    const commissionAmount = donationData.amount * PLATFORM_COMMISSION;
    
    // Calcular la comisión para cada administrador (50% cada uno)
    const commissionPerAdmin = commissionAmount / 2;
    
    // Formatear la fecha
    const formattedDate = donationData.createdAt.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Formatear los montos para mostrarlos en pesos argentinos
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });
    
    const formattedAmount = formatter.format(donationData.amount);
    const formattedCommission = formatter.format(commissionAmount);
    const formattedCommissionPerAdmin = formatter.format(commissionPerAdmin);
    
    // Crear el contenido del correo
    const subject = `Nueva donación recibida - ${formattedAmount}`;
    
    const donorInfo = donationData.anonymous 
      ? 'Donación anónima'
      : `Donante: ${donationData.donorName || 'No especificado'} (${donationData.donorEmail || 'Email no especificado'})`;
    
    const htmlContent = `
      <h2>Nueva donación recibida</h2>
      <p><strong>Fecha:</strong> ${formattedDate}</p>
      <p><strong>Monto:</strong> ${formattedAmount}</p>
      <p><strong>${donorInfo}</strong></p>
      <p><strong>ID de Pago:</strong> ${donationData.paymentId || 'No disponible'}</p>
      <p><strong>ID de Donación:</strong> ${donationData.id}</p>
      <hr />
      <h3>Comisiones</h3>
      <p><strong>Comisión total (${PLATFORM_COMMISSION * 100}%):</strong> ${formattedCommission}</p>
      <p><strong>Comisión Mauro:</strong> ${formattedCommissionPerAdmin}</p>
      <p><strong>Comisión Franco:</strong> ${formattedCommissionPerAdmin}</p>
    `;
    
    // Enviar el correo a los administradores
    const { data, error } = await resend.emails.send({
      from: 'Fundación TEA Santa Cruz <onboarding@resend.dev>',
      to: ADMIN_EMAILS,
      subject,
      html: htmlContent,
    });
    
    if (error) {
      console.error('Error al enviar correo de notificación:', error);
      return { success: false, error };
    }
    
    console.log('Correo de notificación enviado con éxito:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    return { success: false, error };
  }
}

/**
 * Envía un correo electrónico de agradecimiento al donante cuando la donación no es anónima
 * @param donationData Datos de la donación
 */
export async function sendThankYouEmailToDonor(donationData: DonationData) {
  // Si la donación es anónima o no hay correo del donante, no enviamos nada
  if (donationData.anonymous || !donationData.donorEmail) {
    return { success: false, error: 'Donación anónima o sin correo electrónico' };
  }

  try {
    // Formatear el monto para mostrarlo en pesos argentinos
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    });
    
    const formattedAmount = formatter.format(donationData.amount);
    const firstName = donationData.donorName?.split(' ')[0] || 'Donante';
    const frequency = donationData.frequency || 'once';
    
    // Crear el contenido del correo
    const subject = `¡Gracias por tu donación a Fundación TEA Santa Cruz!`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #222; background: #f8fafc; padding: 24px;">
        <h2 style="color: #165a91; font-size: 24px; font-weight: bold; margin-bottom: 16px;">¡Gracias por tu donación!</h2>
        
        <p style="font-size: 18px; color: #333; margin-bottom: 16px;">
          ${firstName}, tu generosidad hace una gran diferencia.
        </p>
        
        <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
          Tu donación ${frequency === 'monthly' ? 'mensual' : 'única'} de <strong>${formattedAmount}</strong> ha sido recibida con éxito y ayudará a continuar 
          con nuestra misión de apoyar a personas con TEA y sus familias.
        </p>
        
        <div style="background: #EBF5FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="color: #165a91; font-size: 18px; font-weight: bold; margin-bottom: 12px;">
            ¿Qué lograremos con tu apoyo?
          </h3>
          <ul style="text-align: left; color: #444; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Ampliar nuestros programas de intervención temprana</li>
            <li style="margin-bottom: 8px;">Brindar capacitación a profesionales y familias</li>
            <li style="margin-bottom: 8px;">Realizar campañas de concientización sobre el TEA</li>
            <li style="margin-bottom: 8px;">Mejorar la calidad de vida de las personas con TEA</li>
          </ul>
        </div>
        
        ${frequency === 'monthly' ? `
        <p style="font-size: 16px; color: #555; margin-bottom: 16px;">
          Como has elegido una donación mensual, recibirás un recordatorio cada mes para renovar tu compromiso.
        </p>
        ` : ''}
        
        <a 
          href="https://fundacionteasantacruz.org/donaciones" 
          style="
            display: inline-block;
            background: #f6bb3f;
            color: #fff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 16px;
            margin-bottom: 24px;
          "
        >
          Realizar otra donación
        </a>
        
        <div style="margin-top: 24px; border-top: 1px solid #ddd; padding-top: 16px;">
          <p style="font-size: 14px; color: #888;">Fundación TEA Santa Cruz</p>
          <p style="font-size: 14px; color: #888;">#somosinfinitos</p>
        </div>
      </div>
    `;
    
    // Enviar el correo al donante
    const { data, error } = await resend.emails.send({
      from: 'Fundación TEA Santa Cruz <onboarding@resend.dev>',
      to: donationData.donorEmail,
      subject,
      html: htmlContent,
    });
    
    if (error) {
      console.error('Error al enviar correo de agradecimiento:', error);
      return { success: false, error };
    }
    
    console.log('Correo de agradecimiento enviado con éxito:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error al enviar correo de agradecimiento:', error);
    return { success: false, error };
  }
}

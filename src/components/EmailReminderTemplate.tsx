import * as React from 'react';

interface EmailReminderTemplateProps {
  firstName: string;
  donationUrl: string;
}

export const EmailReminderTemplate: React.FC<Readonly<EmailReminderTemplateProps>> = ({
  firstName,
  donationUrl
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', background: '#f8fafc', padding: 24 }}>
    <h2 style={{ color: '#2b9348' }}>¡Hola {firstName}!</h2>
    <p>Hace 30 días realizaste una donación mensual a Fundación TEA Santa Cruz. ¡Tu apoyo es fundamental para seguir ayudando a quienes más lo necesitan!</p>
    <p>¿Te gustaría renovar tu compromiso solidario? Puedes volver a donar haciendo click en el siguiente botón:</p>
    <a href={donationUrl} style={{
      display: 'inline-block',
      background: '#f6bb3f',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: 8,
      textDecoration: 'none',
      fontWeight: 600,
      margin: '16px 0',
    }}>Donar nuevamente</a>
    <p>¡Gracias por ser parte de nuestra comunidad!</p>
    <p style={{ fontSize: 13, color: '#888' }}>Si ya realizaste una nueva donación, puedes ignorar este mensaje.</p>
    <p style={{ fontSize: 13, color: '#888' }}>#somosinfinitos</p>
  </div>
);

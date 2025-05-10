import * as React from 'react';

interface EmailThankYouTemplateProps {
    firstName: string;
    amount: string;
    frequency: string;
}

export const EmailThankYouTemplate: React.FC<Readonly<EmailThankYouTemplateProps>> = ({
    firstName,
    amount,
    frequency
}) => {
    const donationType = frequency === 'monthly' ? 'mensual' : 'única';

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', background: '#f8fafc', padding: 24 }}>
            <h2 style={{ color: '#165a91', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>¡Gracias por tu donación!</h2>

            <p style={{ fontSize: '18px', color: '#333', marginBottom: '16px' }}>
                {firstName && `${firstName}, tu`} generosidad hace una gran diferencia.
            </p>

            <p style={{ fontSize: '16px', color: '#555', marginBottom: '24px' }}>
                Tu donación {donationType} de <strong>{amount}</strong> ha sido recibida con éxito y ayudará a continuar
                con nuestra misión de apoyar a personas con TEA y sus familias.
            </p>

            <div style={{ background: '#EBF5FF', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ color: '#165a91', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                    ¿Qué lograremos con tu apoyo?
                </h3>
                <ul style={{ textAlign: 'left', color: '#444', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '8px' }}>Ampliar nuestros programas de intervención temprana</li>
                    <li style={{ marginBottom: '8px' }}>Brindar capacitación a profesionales y familias</li>
                    <li style={{ marginBottom: '8px' }}>Realizar campañas de concientización sobre el TEA</li>
                    <li style={{ marginBottom: '8px' }}>Mejorar la calidad de vida de las personas con TEA</li>
                </ul>
            </div>

            {frequency === 'monthly' && (
                <p style={{ fontSize: '16px', color: '#555', marginBottom: '16px' }}>
                    Como has elegido una donación mensual, recibirás un recordatorio cada mes para renovar tu compromiso.
                </p>
            )}

            <a
                href="https://fundacionteasantacruz.org/donaciones"
                style={{
                    display: 'inline-block',
                    background: '#f6bb3f',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    marginTop: '16px',
                    marginBottom: '24px'
                }}
            >
                Realizar otra donación
            </a>

            <div style={{ marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
                <p style={{ fontSize: '14px', color: '#888' }}>Fundación TEA Santa Cruz</p>
                <p style={{ fontSize: '14px', color: '#888' }}>#somosinfinitos</p>
            </div>
        </div>
    );
};

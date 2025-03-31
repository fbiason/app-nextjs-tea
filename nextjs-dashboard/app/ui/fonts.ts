import { Montserrat, Lusitana } from 'next/font/google';

// Cargar la fuente Montserrat y asignarla a una constante
const montserratFont = Montserrat({ subsets: ['latin'] });

// Exportar la clase de la fuente para usarla en otros componentes
export const defaultFont = montserratFont.className;

export const fontSizes = {
  small: '12px',
  medium: '16px',
  large: '20px',
};

export const fontWeights = {
  normal: 400,
  bold: 700,
};

export const lusitanaFont = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });  
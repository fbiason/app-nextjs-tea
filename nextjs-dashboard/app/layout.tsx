import { defaultFont } from './ui/fonts';
import './ui/global.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={defaultFont}>
        {children}
        <footer className='py-10 flex items-center justify-center text-sm text-muted-foreground'>Biason 2025</footer>
      </body>
    </html>
  );
}

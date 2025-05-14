import { createClient } from '@supabase/supabase-js';

// Crear un cliente de Supabase con las credenciales de entorno
// Usamos las variables de entorno para permitir diferentes configuraciones en desarrollo y producción
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vaqewiqgasgiitudgmpv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcWV3aXFnYXNnaWl0dWRnbXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Nzc0MjYsImV4cCI6MjA1ODE1MzQyNn0.uuDYTgPqaNEDse1n0c1wwLBpdf9ijEGPiHDQs-L6ohM'
);

// Desactivamos explícitamente cualquier comportamiento que pueda crear archivos locales
// para asegurar compatibilidad con entornos serverless

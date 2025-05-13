import { createClient } from '@supabase/supabase-js';

// Crear un cliente de Supabase con las credenciales del proyecto
export const supabase = createClient(
  'https://vaqewiqgasgiitudgmpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcWV3aXFnYXNnaWl0dWRnbXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Nzc0MjYsImV4cCI6MjA1ODE1MzQyNn0.uuDYTgPqaNEDse1n0c1wwLBpdf9ijEGPiHDQs-L6ohM'
);

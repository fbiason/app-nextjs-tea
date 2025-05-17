import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

// Endpoint para probar la conexión a la base de datos
export async function GET() {
  try {
    logger.info('DB_TEST', 'Iniciando prueba de conexión a Supabase');
    
    // 1. Verificar conexión básica contando usuarios
    const { count: userCount, error: userCountError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true });
      
    if (userCountError) {
      logger.error('DB_TEST', `Error al contar usuarios: ${userCountError.message}`, { error: userCountError });
      throw userCountError;
    }
    
    logger.info('DB_TEST', `Conexión a tabla User exitosa - ${userCount || 0} usuarios encontrados`);
    
    // 2. Verificar conexión a tabla Donation
    const { count: donationCount, error: donationCountError } = await supabase
      .from('Donation')
      .select('*', { count: 'exact', head: true });
      
    if (donationCountError) {
      logger.error('DB_TEST', `Error al contar donaciones: ${donationCountError.message}`, { error: donationCountError });
      throw donationCountError;
    }
    
    logger.info('DB_TEST', `Conexión a tabla Donation exitosa - ${donationCount || 0} donaciones encontradas`);
    
    // 3. Intentamos obtener un registro de cada tabla para verificar la estructura
    const userStructure = await getTableStructure('User');
    const donationStructure = await getTableStructure('Donation');
    
    const tableInfo = {
      User: userStructure,
      Donation: donationStructure
    };
    
    // Función auxiliar para obtener la estructura de una tabla
    async function getTableStructure(tableName: string) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          logger.info('DB_TEST', `No se pudo obtener información de la tabla ${tableName}: ${error.message}`);
          return null;
        }
        
        // Si hay datos, extraemos las claves (nombres de columnas)
        if (data && data.length > 0) {
          return Object.keys(data[0]);
        }
        
        // Si no hay datos pero no hubo error, la tabla existe pero está vacía
        return [];
      } catch (error) {
        logger.info('DB_TEST', `Error al obtener estructura de ${tableName}`, { error });
        return null;
      }
    }
    
    logger.info('DB_TEST', 'Conexión a Supabase verificada correctamente', { 
      userCount,
      donationCount,
      userColumns: tableInfo.User?.length || 0,
      donationColumns: tableInfo.Donation?.length || 0
    });
    
    // Obtener la URL de la base de datos para verificar que las variables de entorno están correctas
    const databaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'No disponible';
    
    return NextResponse.json({ 
      success: true, 
      message: "Conexión exitosa a Supabase",
      database: {
        url: databaseUrl.replace(/^https?:\/\/|:[0-9]+/g, '***'), // Ocultamos detalles sensibles
        tables: {
          User: { count: userCount || 0 },
          Donation: { count: donationCount || 0 }
        },
        schema: {
          User: tableInfo.User || [],
          Donation: tableInfo.Donation || []
        }
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logger.error('DB_TEST', 'Error al conectar con Supabase', { error: errorMessage });
    
    // Intentamos obtener información sobre la configuración para diagnóstico
    const diagnosticInfo = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configurado' : 'no configurado',
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configurado' : 'no configurado',
      databaseUrl: process.env.DATABASE_URL ? 'configurado' : 'no configurado',
      directUrl: process.env.DIRECT_URL ? 'configurado' : 'no configurado'
    };
    
    return NextResponse.json({ 
      success: false, 
      message: `Error al conectar con Supabase: ${errorMessage}`,
      error: errorMessage,
      config: diagnosticInfo
    }, { status: 500 });
  }
}

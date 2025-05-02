-- Añadir columna frequency a la tabla Donation si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Donation' 
        AND column_name = 'frequency'
    ) THEN 
        ALTER TABLE "Donation" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'once';
    END IF;
END $$;

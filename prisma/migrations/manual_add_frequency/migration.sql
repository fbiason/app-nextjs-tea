-- Añadir columna frequency a la tabla Donation
ALTER TABLE "Donation" ADD COLUMN "frequency" TEXT NOT NULL DEFAULT 'once';

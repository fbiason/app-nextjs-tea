-- Verificar las tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar la estructura de la tabla Donation
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Donation';

-- Verificar la estructura de la tabla User
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'User';

-- Contar registros en la tabla Donation
SELECT COUNT(*) FROM "Donation";

-- Contar registros en la tabla User
SELECT COUNT(*) FROM "User";

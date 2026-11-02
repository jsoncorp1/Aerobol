using Microsoft.EntityFrameworkCore;

namespace Aerobol.Data;

public static class MigrationHistory
{
    // Las bases iniciadas antes de fijar el historial en el esquema aerobol lo tienen en public.
    // Solo se mueve si esa tabla contiene la migración de Aerobol: public puede ser de otra aplicación.
    public static Task AdoptAsync(AerobolDbContext db) => db.Database.ExecuteSqlRawAsync("""
        DO $$
        BEGIN
            IF to_regclass('aerobol."__EFMigrationsHistory"') IS NULL
               AND to_regclass('aerobol."Preinscripciones"') IS NOT NULL
               AND to_regclass('public."__EFMigrationsHistory"') IS NOT NULL THEN
                IF EXISTS (SELECT 1 FROM public."__EFMigrationsHistory" WHERE "MigrationId" LIKE '%\_InitialAerobol') THEN
                    ALTER TABLE public."__EFMigrationsHistory" SET SCHEMA aerobol;
                END IF;
            END IF;
        END $$;
        """);
}

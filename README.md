# CuantoCobras

Buscador salarial colaborativo y foro financiero para Argentina.

## Requisitos

- Node.js
- Un proyecto en Supabase

## Configuracion local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear `.env.local` usando `.env.example` como base:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

3. En Supabase, abrir el SQL Editor y ejecutar:

   ```text
   supabase/schema.sql
   ```

4. En Supabase Auth, habilitar Google como proveedor OAuth y agregar la URL local:

   ```text
   http://localhost:3000
   ```

5. Ejecutar la app:

   ```bash
   npm run dev
   ```

## Notas

- Si Supabase no esta configurado, la app usa datos mínimos en memoria para poder abrir la interfaz.
- La tabla `professions` se carga con una base inicial desde `supabase/schema.sql`.
- Para convertir un usuario en admin, actualizar su perfil en Supabase:

  ```sql
  update public.profiles set role = 'admin' where email = 'tu-email@dominio.com';
  ```

# TecnoCommerce — TP Taller Web 2

E-commerce de hardware y periféricos.

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (`src/`) |
| Backend | Node + Express 5 + TypeScript (`Backend/`) |
| Base de datos | PostgreSQL 17 en Docker + Prisma 7 (`Backend/prisma/`) |

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- Una base **PostgreSQL**. La forma recomendada es [Docker Desktop](https://www.docker.com/products/docker-desktop/) (corriendo),
  pero también se puede usar sin Docker: ver [Sin Docker](#sin-docker).

## Cómo levantar el proyecto (primera vez)

Todos los comandos se ejecutan **desde la raíz del proyecto**.

```bash
# 1. Instalar dependencias (también genera el cliente de Prisma)
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env          # en Windows (cmd):  copy .env.example .env

# 3. Levantar Postgres, crear las tablas y cargar datos de prueba
npm run setup
```

Después, en **dos terminales separadas**:

```bash
npm run server    # Backend  → http://localhost:3000  (se reinicia solo al guardar cambios)
npm start         # Frontend → http://localhost:4200
```

### Sin Docker

Docker solo se usa para tener PostgreSQL. El backend se conecta a cualquier Postgres
que indique `DATABASE_URL` en el `.env`, así que se puede reemplazar por una de estas opciones:

**Opción A — Postgres instalado en la PC**

1. Descargar e instalar PostgreSQL 17 desde [postgresql.org/download](https://www.postgresql.org/download/).
   Durante la instalación se elige una contraseña para el usuario `postgres`.
2. Crear una base vacía llamada `prisma`, con pgAdmin (viene con el instalador) o por consola:
   ```bash
   createdb -U postgres prisma
   ```
3. En el `.env`, poner tu contraseña:
   ```
   DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/prisma"
   ```

**Opción B — Postgres en la nube (gratis)**

1. Crear una base en [Neon](https://neon.tech) o [Supabase](https://supabase.com).
2. Copiar la *connection string* que te dan y pegarla en `DATABASE_URL` del `.env`.

> Conviene que cada integrante tenga **su propia** base: si comparten una, comparten los datos
> y las migraciones de uno le afectan a todos.

**Después (cualquiera de las dos opciones)**, en lugar de `npm run setup`:

```bash
npm install
npm run db:migrate   # crea las tablas
npm run db:seed      # carga los datos de prueba
```

y se levanta igual que siempre con `npm run server` y `npm start`.
Los scripts `db:up`, `db:down` y `setup` usan Docker, así que sin Docker no hay que usarlos;
el resto (`db:reset`, `db:studio`, etc.) funciona igual.

### Usuarios de prueba (los crea el seed)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@tecno.com` | `Admin1234` |
| Cliente | `cliente@tecno.com` | `Cliente1234` |

El admin ve el link **Administración** en el header (alta, edición y baja de productos).

## Día a día

```bash
git pull
npm install          # por si alguien agregó dependencias
npm run db:up        # si Docker estaba apagado (sin Docker: verificar que tu Postgres esté corriendo)
npm run db:migrate   # por si alguien agregó migraciones
npm run server       # terminal 1
npm start            # terminal 2
```

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm start` | Frontend en modo desarrollo (puerto 4200) |
| `npm run server` | Backend con recarga automática (puerto 3000) |
| `npm run setup` | `db:up` + `db:migrate` + `db:seed` (primera vez) |
| `npm run db:up` / `db:down` | Prende / apaga el contenedor de Postgres |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:migrate:dev -- --name descripcion` | **Crea** una migración nueva después de cambiar el schema |
| `npm run db:seed` | Carga los datos de prueba (se puede correr varias veces) |
| `npm run db:reset` | ⚠️ Borra **toda** la base y la recrea con migraciones + seed |
| `npm run db:studio` | Abre Prisma Studio para ver/editar la base desde el navegador |
| `npm run build` | Build de producción del frontend |
| `npm test` | Tests unitarios del frontend |
| `npm run typecheck:back` | Chequea los tipos del backend |

## Cambiar la base de datos (schema.prisma)

1. Editar `Backend/prisma/schema.prisma`.
2. Crear la migración: `npm run db:migrate:dev -- --name que_cambiaste`
3. **Commitear el schema y la carpeta nueva dentro de `Backend/prisma/migrations/`.**

Los demás solo tienen que correr `npm run db:migrate` después del `git pull`.
Para evitar conflictos, coordinen para que **una sola persona a la vez** cree migraciones.

## API (resumen)

Base: `http://localhost:3000/api`. Las rutas con 🔒 requieren `Authorization: Bearer <token>`
(el frontend lo agrega solo, ver `src/app/interceptors/auth.interceptor.ts`). 👑 = solo ADMIN.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/usuarios/registrar` | Registro `{ usuario: {nombre, apellido, email, direccion}, login: {password} }` |
| POST | `/usuarios/login` | Login `{ email, password }` → `{ token, usuario }` |
| GET | `/usuarios/me` 🔒 | Datos del usuario logueado |
| GET | `/productos` | Catálogo |
| GET | `/productos/destacados` | Productos destacados |
| GET | `/categorias`, `/subcategorias` | Clasificación de productos |
| GET/POST/PUT/DELETE | `/productos/admin/...` 👑 | ABM de productos |
| POST | `/categorias`, `/subcategorias` 👑 | Alta de categorías |
| GET | `/pedidos` 🔒 | Pedidos del usuario logueado |
| POST | `/pedidos` 🔒 | Crea un pedido en estado `carrito` |
| GET | `/pedidos/:id` 🔒 | Detalle del pedido con productos y total |
| POST | `/pedidos/:id/productos` 🔒 | Agrega `{ id_producto, cantidad }` (el precio lo pone el servidor) |

Los errores siempre responden `{ "error": "mensaje" }` con el código HTTP correspondiente.

## Estructura

```
Backend/
  server.ts              → arranque de Express y registro de rutas
  prisma/                → schema, migraciones y seed
  src/routes/            → URLs → controller
  src/controller/        → lee la request y arma la response
  src/service/           → reglas de negocio y validaciones
  src/repository/        → consultas a la base con Prisma
  src/middleware/        → autenticación (JWT) y manejo de errores
src/app/                 → frontend Angular (componentes, servicios, guards, interceptor)
```

## Problemas comunes

| Error | Solución |
|---|---|
| `Falta la variable de entorno DATABASE_URL` | No existe el `.env` en la raíz: `cp .env.example .env` |
| `Can't reach database server at localhost:5432` | Docker apagado: abrir Docker Desktop y `npm run db:up`. Sin Docker: iniciar el servicio de PostgreSQL |
| `Authentication failed against database server` | Usuario o contraseña incorrectos en `DATABASE_URL` del `.env` |
| `Database "prisma" does not exist` | Sin Docker: falta crear la base (`createdb -U postgres prisma`) |
| `Cannot find module '.prisma/client/default'` | `npx prisma generate` (o `npm install`) |
| `The column ... does not exist` | Faltan migraciones: `npm run db:migrate` |
| Al migrar: *"drift detected"* / pide resetear | Tu base quedó distinta del historial: `npm run db:reset` (borra los datos locales) |
| `No existe el rol CLIENTE` al registrarse | `npm run db:seed` |
| `EADDRINUSE: address already in use :::3000` | Ya hay un backend corriendo en otra terminal: cerralo |
| Después de actualizar, el front pide loguearse de nuevo | Normal si cambió el formato del token: volvé a iniciar sesión |

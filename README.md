# MoviGo

Plataforma web para la venta y el alquiler de bicicletas, patinetas, motos, vehículos eléctricos y drones, con servicio de domicilios y mantenimiento.

> **Proyecto académico con fines educativos.** Desarrollado para el curso de Ingeniería de Software de la Universidad Autónoma de Bucaramanga (UNAB). Las marcas y productos que aparecen pertenecen a sus respectivos dueños y no hay fines comerciales.

## Stack

- **Frontend y backend:** Next.js (App Router) con React y TypeScript.
- **Estilos y animación:** Tailwind CSS, Lenis, GSAP y Three.js.
- **Base de datos y autenticación:** Supabase (PostgreSQL) con Prisma.
- **Validación:** zod.
- **Despliegue:** Vercel, con integración continua en GitHub Actions.

## Arquitectura

El código se organiza por lo que hace el negocio, no por tipo de archivo.

```
src/
├─ app/                     rutas. (cliente)/ sin prefijo, empresa/, admin/, (auth)/, api/
├─ modulos/                 un módulo por área del negocio
│  ├─ gestion-catalogo/     productos, categorías y medios
│  ├─ gestion-almacen/      stock, unidades físicas y movimientos
│  ├─ gestion-servicios/    alquiler, mantenimiento y domicilios
│  ├─ gestion-pedidos/      carrito y compras
│  ├─ gestion-pagos/
│  ├─ gestion-usuarios/     cuentas y roles
│  └─ gestion-notificaciones/
├─ compartido/
│  ├─ interfaz/             componentes base, layout, animaciones, escena 3D
│  ├─ servidor/             base de datos, Supabase, autenticación, errores, configuración
│  ├─ utilidades/
│  └─ tipos/
└─ estilos/                 tokens de diseño
database/                   migraciones y semillas
public/                     imágenes, fuentes y modelos 3D
docs/                       documentación y diagramas
.github/workflows/          integración continua
```

Cada módulo se divide en dos mitades:

- `interfaz/` es el frontend del módulo (componentes y hooks).
- `servidor/` es el backend del módulo, con cuatro archivos: `acciones.ts` (único punto de entrada desde la interfaz), `servicio.ts` (reglas de negocio), `repositorio.ts` (acceso a datos) y `validaciones.ts` (esquemas zod).

Reglas de dependencia:

1. La interfaz solo llama a `acciones.ts`; nunca importa `servicio.ts` ni `repositorio.ts`.
2. Solo `repositorio.ts` habla con la base de datos.
3. El catálogo describe lo que se muestra; el almacén controla las unidades físicas. Servicios y pedidos usan el almacén, y el almacén usa el catálogo, nunca al revés.

## Cómo correrlo

```bash
npm install
cp .env.ejemplo .env.local   # y completa los valores
npm run dev
```

La app queda en http://localhost:3000.

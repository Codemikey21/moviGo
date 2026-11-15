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
npm run db:aplicar           # crea las tablas en Supabase
npm run db:semilla           # categorías, puntos, criterios, productos y unidades
npm run db:admin -- tu@correo.com   # vuelve administradora una cuenta ya registrada
npm run dev
```

## Base de datos

El esquema está en `database/schema.prisma` y sale del diagrama de clases. Las migraciones son archivos `.sql` en `database/migraciones/`, uno por módulo del negocio:

| Archivo | Qué crea |
|---|---|
| `gestion_almacen.sql` | puntos de servicio, unidades y movimientos de stock |
| `gestion_catalogo.sql` | categorías, productos y medios |
| `gestion_catalogo_fotos.sql` | bucket `productos` en Storage: fotos públicas que solo un administrador sube o borra |
| `gestion_notificaciones.sql` | notificaciones |
| `gestion_pagos.sql` | pagos y avisos de la pasarela |
| `gestion_pedidos.sql` | carritos, pedidos y sus líneas |
| `gestion_servicios.sql` | alquileres, domicilios, seguimiento, evidencias y mantenimiento |
| `gestion_servicios_entregas.sql` | domicilios de pedidos de compra que salen de un punto de servicio |
| `gestion_usuarios.sql` | usuarios, clientes, domiciliarios, administradores y direcciones |
| `gestion_usuarios_autenticacion.sql` | crea el perfil de MoviGo cuando alguien se registra en Supabase Auth |
| `portal_empresarial.sql` | empresas, contactos, solicitudes y cotizaciones |
| `relaciones.sql` | llaves foráneas entre tablas de módulos distintos |
| `seguridad_rls.sql` | activa RLS en todas las tablas para cerrar la API pública de Supabase |

Se aplican en orden alfabético, que es el mismo en que aparecen en la carpeta. `npm run db:aplicar` lo hace solo; también se pueden pegar uno por uno en el SQL Editor de Supabase.

Si cambias el esquema, `npm run db:diferencias` muestra el SQL que falta en la base. Ese SQL se guarda en el archivo `.sql` del módulo correspondiente o en uno nuevo. Para ver los datos: `npm run db:estudio`.

La app queda en http://localhost:3000.

## Lo que hace la plataforma

| Para el cliente | Ruta |
|---|---|
| Catálogo con filtros (categoría, comprar o alquilar) | `/catalogo` |
| Ficha del producto: comprar o alquilar por días, disponibilidad por punto | `/producto/<slug>` |
| Carrito y entrega (recoger en un punto o a domicilio) | `/carrito` |
| Pasarela de pagos (tarjeta, Nequi o PSE de prueba) | `/pagar/<referencia>` |
| Inicio de la cuenta: lo que está en curso, novedades y datos | `/mi-cuenta` |
| Seguimiento del pedido con mapa (OpenStreetMap) | `/mi-cuenta/pedidos/<numero>` |
| Alquiler con código de recogida | `/mi-cuenta/alquileres/<id>` |
| Mantenimiento de los vehículos comprados | `/mi-cuenta/mantenimiento` |
| Portal empresarial: solicitar y aceptar cotizaciones | `/empresas` |

| Para el administrador | Ruta |
|---|---|
| Resumen: ingresos, pedidos por atender, alquileres, domicilios e inventario | `/admin` |
| Pedidos: preparar, entregar o cancelar (con reembolso) | `/admin/pedidos` |
| Alquileres: entregar con el código y recibir la devolución | `/admin/alquileres` |
| Domicilios en vivo: asignar domiciliario, salir a ruta, entregado | `/admin/domicilios` |
| Taller y empresas (cotizaciones) | `/admin/mantenimiento`, `/admin/empresas` |
| Inventario y usuarios (roles) | `/admin/inventario`, `/admin/usuarios` |

### Pagos

La pasarela es simulada (proyecto académico) pero sigue el flujo de una real: cada pedido o alquiler crea un `Pago`, la pasarela responde con un aviso firmado (HMAC con `PASARELA_SECRETO`) y ese aviso actualiza el pago, el pedido y el inventario. El mismo aviso puede llegar por `POST /api/webhooks/pagos`, que es donde se conectaría Wompi o Mercado Pago cambiando solo `src/modulos/gestion-pagos/servidor/pasarela.ts`.

- Tarjeta `4242 4242 4242 4242` → aprobada · `4000 0000 0000 0002` → rechazada (cualquier fecha futura y CVV).
- Nequi `300 000 0002` → rechazado; cualquier otro celular → aprobado.
- PSE "Banco de pruebas (rechaza)" → rechazado; los demás bancos → aprobado.

### Seguimiento

El domiciliario se mueve sobre la ruta real de calles (OSRM de OpenStreetMap; si no responde, una ruta en L) durante 8 minutos desde que sale. El mapa del cliente pregunta su posición cada 4 segundos.

## Panel de administración

`/admin/inventario` (solo administradores) lista los productos con sus unidades por punto. Desde la ficha de cada producto se suben fotos, se editan datos y precios, se registra el ingreso de unidades (con el serial del fabricante o uno interno) y se mandan al taller o se trasladan; cada cambio queda como movimiento de stock.

- El administrador del sistema maneja todo; el administrador de punto solo mueve unidades de su punto.
- Las fotos van del navegador directo a Supabase Storage (se reducen a 1600 px en WebP). No hace falta la clave secreta: las políticas de `gestion_catalogo_fotos.sql` solo dejan subir a administradores.
- Los productos de la semilla (`database/semillas/datos-productos.ts`) son modelos reales con precios de referencia: conviene revisarlos antes de una presentación.

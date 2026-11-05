-- seguridad_rls
-- Supabase publica las tablas del esquema public por su API.
-- Con RLS activo y sin políticas, nadie entra por esa API con la clave pública.
-- Prisma se conecta como el dueño de las tablas, así que a él no lo afecta.
-- Cada tabla nueva que se cree en el futuro también debe activar RLS.

ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "domiciliarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "administradores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "direcciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notificaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "productos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "medios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "puntos_servicio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "unidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "movimientos_stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "empresas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contactos_empresa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "solicitudes_corporativas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cotizaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carritos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "items_carrito" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pedidos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineas_pedido" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alquileres" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "domicilios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registros_ubicacion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "evidencias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mantenimientos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alertas_mantenimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "criterios_mantenimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pagos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "eventos_webhook" ENABLE ROW LEVEL SECURITY;

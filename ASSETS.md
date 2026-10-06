# Recursos de imagen y video

Este archivo explica cómo se agregan las fotos y los videos de los productos y
lleva el registro de cada recurso: de dónde sale, quién es su autor y con qué
licencia o permiso se usa.

**Regla:** solo se agregan fotos y videos con una licencia que permita usarlos o
con permiso por escrito de quien tiene los derechos. Las fotos oficiales de los
fabricantes tienen derechos de autor: no se usan sin permiso. Cada archivo debe
tener su fila en la tabla de registro (al final).

## Carpetas

| Carpeta | Contenido | ¿Se versiona? |
| --- | --- | --- |
| `public/productos-origen/` | Fotos originales, sin optimizar | No (está en `.gitignore`) |
| `public/productos/` | Fotos optimizadas en WebP 4:3 (1600 × 1200) | Sí |
| `public/productos/video/` | Videos opcionales y sus pósters | Sí |

## Agregar fotos

1. Copia las fotos originales a `public/productos-origen/`. Cada archivo se llama
   `<categoria>-<slug>-<idVista>.<extensión>`; por ejemplo
   `patinetas-niu-kqi3-pro-lateral.jpg`. El `slug` de cada producto está en
   `src/data/catalogo.js`. Extensiones admitidas: jpg, jpeg, png, webp, tif, tiff, avif.
2. Ejecuta `npm run imagenes`. El comando:
   - valida que la categoría, el producto y la vista existan, y avisa de los archivos que no coinciden;
   - genera `public/productos/<categoria>-<slug>-<idVista>.webp` en 4:3 (1600 × 1200), bajando la calidad hasta que cada archivo pese 200 KB o menos;
   - avisa si la foto es más pequeña que 1600 × 1200 o no es 4:3 (se recorta al centro);
   - actualiza `src/data/medios.generado.json` con las vistas que existen de cada producto.
3. Revisa el resumen que imprime el comando, agrega las filas a la tabla de registro y
   versiona `public/productos/` y `src/data/medios.generado.json`.

No hace falta editar los productos: el catálogo lee el manifiesto y arma las
vistas solo. Un producto muestra únicamente las vistas que tiene. Sin ninguna
foto, la ficha muestra el marcador "Foto pendiente".

Para volver a generar solo el manifiesto (por ejemplo, después de borrar una foto
de `public/productos/`): `npm run imagenes -- --solo-manifiesto`.

### Vistas por categoría

Las vistas aparecen en este orden y con estas etiquetas (definidas en `src/data/vistas.js`).

| Categoría | Vistas (`idVista`) |
| --- | --- |
| carros | `frente`, `lateral`, `trasera`, `interior`, `tablero`, `maletero` |
| motos | `frente`, `lateral`, `trasera`, `tablero`, `bateria` |
| bicicletas | `lateral`, `frente`, `cambios-frenos`, `cuadro` |
| patinetas | `lateral`, `plegada`, `pantalla`, `ruedas-frenos` |
| patines | `lateral`, `botin`, `ruedas`, `detalle` |
| drones | `frente`, `plegado`, `control`, `camara` |
| accesorios | `vista-1`, `vista-2`, `vista-3` |

## Agregar un video (opcional)

Cada producto puede tener un video corto, silenciado y en bucle:

- `public/productos/video/<slug>.mp4`: hasta 5 MB. Se muestra en 16:9.
- `public/productos/video/<slug>-poster.webp`: la imagen que se ve antes de reproducirlo.

El script no convierte videos: los valida y, cuando el `.mp4` y su póster existen
y el video no pasa de 5 MB, los registra en el manifiesto
(`npm run imagenes -- --solo-manifiesto`). Sin esos dos archivos no se muestra nada.

El video se reproduce solo cuando entra en pantalla y se pausa al salir. Con
"reducir movimiento" o con ahorro de datos no se reproduce solo: se ve el póster y
un botón permite reproducirlo.

## Registro

| Archivo | Producto | Vista | Fuente (URL) | Autor | Licencia o permiso |
| --- | --- | --- | --- | --- | --- |

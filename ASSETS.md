# Recursos de imagen y video

Este archivo explica cómo se agregan las fotos y los videos de los productos y
lleva el registro de cada foto: de dónde sale, quién es su autor y qué permiso se
tiene para usarla.

**Estado de los permisos.** Las fotos de este proyecto académico (UNAB) salen de
las páginas oficiales de las marcas, de sus distribuidores o de sus salas de
prensa. Ninguna trae una licencia que autorice publicarla o editarla: las
condiciones que se observaron en cada sitio (derechos reservados, uso personal,
permiso previo por escrito…) están en las notas del final. Por eso se usan solo
como referencia del prototipo y el permiso de publicación de cada una sigue
**pendiente**. Mientras tanto las fotos optimizadas no se versionan (`public/productos/*.webp`
está en `.gitignore`). Cada foto debe tener su fila en el registro.

## Carpetas

| Carpeta | Contenido | ¿Se versiona? |
| --- | --- | --- |
| `public/productos-origen/` | Fotos originales sin optimizar, con `fuentes.csv` | No (está en `.gitignore`) |
| `public/productos-origen/alternativas/` | Fotos candidatas que todavía no se usan | No |
| `public/productos/` | Fotos optimizadas en WebP, sin recortar | No (`*.webp` está en `.gitignore`) |
| `public/productos/video/` | Videos locales opcionales y sus pósters | Sí |
| `src/data/medios.generado.json` | Manifiesto: vistas, medidas y créditos de cada foto | Sí |

## Agregar fotos

1. Copia las fotos originales a `public/productos-origen/`. Cada archivo se llama
   `<categoria>-<slug>-<idVista>.<extensión>`; por ejemplo
   `patinetas-xiaomi-electric-scooter-4-ultra-lateral.png`. El `slug` de cada
   producto está en `src/data/catalogo.js`. Extensiones admitidas: jpg, jpeg, png,
   webp, tif, tiff, avif. Los archivos `.csv` y `.md` de la carpeta se ignoran.
2. Anota el origen de cada foto en `public/productos-origen/fuentes.csv`, con las
   columnas `archivo`, `url_fuente` y `titular_o_marca` (más `producto`, `vista`,
   `terminos_observados` y `notas` si quieres documentarlo).
3. Ejecuta `npm run imagenes`. El comando:
   - valida que la categoría, el producto y la vista existan, y avisa de los archivos que no coinciden;
   - genera WebP **sin recortar**: conserva la proporción de la foto original y la reduce a 1600 px de ancho como máximo (nunca la amplía). Pesa 200 KB o menos: la calidad baja por pasos hasta cumplirlo;
   - si la foto es más ancha que 800 px, genera también una copia pequeña de 800 px (`-sm.webp`, hasta 100 KB) que usan las tarjetas;
   - actualiza `src/data/medios.generado.json` con las vistas de cada producto, el ancho y el alto reales de cada foto y sus créditos (marca y URL de la fuente, tomados de `fuentes.csv`).
4. Revisa el resumen que imprime el comando y agrega las filas al registro de abajo.

No hace falta editar los productos: el catálogo lee el manifiesto y arma las
vistas solo. Un producto muestra únicamente las vistas que tiene. Sin ninguna
foto, la ficha muestra el marcador "Foto pendiente".

Para volver a generar solo el manifiesto (por ejemplo, después de borrar una foto
de `public/productos/`): `npm run imagenes -- --solo-manifiesto`. Si `fuentes.csv` no
está, se conservan los créditos que ya tiene el manifiesto.

### Cómo se encaja cada foto

Las fotos tienen proporciones distintas (cuadradas, 4:3, 16:9, apaisadas, verticales).
Para que la página no se mueva mientras carga, cada contenedor reserva su espacio con una proporción fija:

- **Ficha del producto:** el marco toma la proporción de la primera vista y no cambia al pasar de una vista a otra.
- **Tarjeta:** el contenedor es siempre 4:3.

La foto se encaja según su proporción real: si difiere menos del 10 % de la del contenedor, lo llena (`cover`);
si difiere más, se ve completa sobre un fondo neutro (`contain`).

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

## Videos

**Videos oficiales (enlaces).** `src/data/videos.js` guarda el ID de YouTube, el título y el
canal de los videos oficiales confirmados para el modelo exacto. Solo son enlaces:
ningún video se descarga ni se copia al proyecto.

**Video local opcional.** Cada producto puede tener un video corto, silenciado y en bucle:

- `public/productos/video/<slug>.mp4`: hasta 5 MB. Se muestra en 16:9.
- `public/productos/video/<slug>-poster.webp`: la imagen que se ve antes de reproducirlo.

El script no convierte videos: los valida y, cuando el `.mp4` y su póster existen y el
video no pasa de 5 MB, los registra en el manifiesto (`npm run imagenes -- --solo-manifiesto`).
Sin esos dos archivos no se muestra nada. El video se reproduce solo cuando entra en pantalla y
se pausa al salir; con "reducir movimiento" o con ahorro de datos no se reproduce solo: se ve
el póster y un botón permite reproducirlo.

## Registro

| Archivo | Producto | Vista | Fuente (URL) | Autor | Licencia o permiso |
| --- | --- | --- | --- | --- | --- |
| `bicicletas-rockhopper-sport-lateral.webp` | Specialized Rockhopper Sport | `lateral` | <https://www.specialized.com/co/es/rockhopper-sport/p/4263615> | Specialized | Permiso de publicación pendiente (ver nota 1) |
| `bicicletas-rockhopper-sport-frente.webp` | Specialized Rockhopper Sport | `frente` | <https://www.specialized.com/co/es/rockhopper-sport/p/4263615> | Specialized | Permiso de publicación pendiente (ver nota 1) |
| `bicicletas-rockhopper-comp-lateral.webp` | Specialized Rockhopper Comp | `lateral` | <https://www.specialized.com/co/es/rockhopper-comp/p/4263610> | Specialized | Permiso de publicación pendiente (ver nota 1) |
| `bicicletas-rockhopper-comp-frente.webp` | Specialized Rockhopper Comp | `frente` | <https://www.specialized.com/co/es/rockhopper-comp/p/4263610> | Specialized | Permiso de publicación pendiente (ver nota 1) |
| `bicicletas-escape-3-lateral.webp` | Giant Escape 3 | `lateral` | <https://giant-bicycles.com.co/escape-3-2022.html> | Giant | Permiso de publicación pendiente (ver nota 2) |
| `bicicletas-escape-3-frente.webp` | Giant Escape 3 | `frente` | <https://giant-bicycles.com.co/escape-3-2022.html> | Giant | Permiso de publicación pendiente (ver nota 2) |
| `bicicletas-starker-t-flex-lateral.webp` | Starker T-Flex Aluminio | `lateral` | <https://www.auteco.com.co/bicicleta-electrica-starker-t-flex-aluminio/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `bicicletas-starker-t-flex-frente.webp` | Starker T-Flex Aluminio | `frente` | <https://www.auteco.com.co/bicicleta-electrica-starker-t-flex-aluminio/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `patinetas-xiaomi-electric-scooter-4-lite-lateral.webp` | Xiaomi Electric Scooter 4 Lite (2nd Gen) | `lateral` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-lite-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-lite-plegada.webp` | Xiaomi Electric Scooter 4 Lite (2nd Gen) | `plegada` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-lite-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-lite-pantalla.webp` | Xiaomi Electric Scooter 4 Lite (2nd Gen) | `pantalla` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-lite-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-lite-ruedas-frenos.webp` | Xiaomi Electric Scooter 4 Lite (2nd Gen) | `ruedas-frenos` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-lite-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-pro-lateral.webp` | Xiaomi Electric Scooter 4 Pro (2nd Gen) | `lateral` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-pro-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-pro-plegada.webp` | Xiaomi Electric Scooter 4 Pro (2nd Gen) | `plegada` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-pro-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-pro-pantalla.webp` | Xiaomi Electric Scooter 4 Pro (2nd Gen) | `pantalla` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-pro-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-pro-ruedas-frenos.webp` | Xiaomi Electric Scooter 4 Pro (2nd Gen) | `ruedas-frenos` | <https://www.mi.com/co/product/xiaomi-electric-scooter-4-pro-2nd-gen/> | Xiaomi | Permiso de publicación pendiente (ver nota 4) |
| `patinetas-xiaomi-electric-scooter-4-ultra-lateral.webp` | Xiaomi Electric Scooter 4 Ultra | `lateral` | <https://www.mi.com/global/product/xiaomi-electric-scooter-4-ultra/> | Xiaomi | Permiso de publicación pendiente (ver nota 5) |
| `patinetas-xiaomi-electric-scooter-4-ultra-pantalla.webp` | Xiaomi Electric Scooter 4 Ultra | `pantalla` | <https://www.mi.com/global/product/xiaomi-electric-scooter-4-ultra/> | Xiaomi | Permiso de publicación pendiente (ver nota 5) |
| `patinetas-xiaomi-electric-scooter-4-ultra-ruedas-frenos.webp` | Xiaomi Electric Scooter 4 Ultra | `ruedas-frenos` | <https://www.mi.com/global/product/xiaomi-electric-scooter-4-ultra/> | Xiaomi | Permiso de publicación pendiente (ver nota 5) |
| `patinetas-segway-ninebot-max-g2-lateral.webp` | Segway-Ninebot KickScooter Max G2 | `lateral` | <https://store.segway.com/catalog/product/view/id/2519> | Segway-Ninebot | Permiso de publicación pendiente (ver nota 6) |
| `patinetas-segway-ninebot-max-g2-pantalla.webp` | Segway-Ninebot KickScooter Max G2 | `pantalla` | <https://www.segway.com/ekickscooter/products/max-g2.html> | Segway-Ninebot | Permiso de publicación pendiente (ver nota 6) |
| `patinetas-segway-ninebot-max-g2-ruedas-frenos.webp` | Segway-Ninebot KickScooter Max G2 | `ruedas-frenos` | <https://www.segway.com/ekickscooter/products/max-g2.html> | Segway-Ninebot | Permiso de publicación pendiente (ver nota 6) |
| `patines-next-black-80-lateral.webp` | Powerslide Next Black 80 | `lateral` | <https://powerslide.com/products/powerslide-next-black-80> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-next-black-80-botin.webp` | Powerslide Next Black 80 | `botin` | <https://powerslide.com/products/powerslide-next-black-80> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-next-black-80-ruedas.webp` | Powerslide Next Black 80 | `ruedas` | <https://powerslide.com/products/powerslide-next-black-80> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-next-black-80-detalle.webp` | Powerslide Next Black 80 | `detalle` | <https://powerslide.com/products/powerslide-next-black-80> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-phuzion-radon-90-pds-lateral.webp` | Powerslide Phuzion Radon 90 PDS | `lateral` | <https://powerslide.com/products/powerslide-phuzion-radon-90-pds-plum> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-phuzion-radon-90-pds-ruedas.webp` | Powerslide Phuzion Radon 90 PDS | `ruedas` | <https://powerslide.com/products/powerslide-phuzion-radon-90-pds-plum> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-phuzion-radon-90-pds-detalle.webp` | Powerslide Phuzion Radon 90 PDS | `detalle` | <https://powerslide.com/products/powerslide-phuzion-radon-90-pds-plum> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-zoom-pro-80-black-lateral.webp` | Powerslide Zoom Pro 80 Black | `lateral` | <https://powerslide.com/products/powerslide-zoom-pro-80-black> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-zoom-pro-80-black-botin.webp` | Powerslide Zoom Pro 80 Black | `botin` | <https://powerslide.com/products/powerslide-zoom-pro-80-black> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-zoom-pro-80-black-ruedas.webp` | Powerslide Zoom Pro 80 Black | `ruedas` | <https://powerslide.com/products/powerslide-zoom-pro-80-black> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `patines-zoom-pro-80-black-detalle.webp` | Powerslide Zoom Pro 80 Black | `detalle` | <https://powerslide.com/products/powerslide-zoom-pro-80-black> | Powerslide | Permiso de publicación pendiente (ver nota 7) |
| `drones-fimi-mini-3-frente.webp` | FIMI Mini 3 | `frente` | <https://www.fimi.com/fimi-mini-3.html> | FIMI | Permiso de publicación pendiente (ver nota 8) |
| `drones-fimi-mini-3-control.webp` | FIMI Mini 3 | `control` | <https://www.fimi.com/fimi-mini-3.html> | FIMI | Permiso de publicación pendiente (ver nota 8) |
| `drones-fimi-mini-3-camara.webp` | FIMI Mini 3 | `camara` | <https://www.fimi.com/fimi-mini-3.html> | FIMI | Permiso de publicación pendiente (ver nota 8) |
| `drones-fimi-x8-tele-max-frente.webp` | FIMI X8 Tele Max | `frente` | <https://www.fimi.com/fimi-x8-tele-max.html> | FIMI | Permiso de publicación pendiente (ver nota 9) |
| `drones-fimi-x8-tele-max-control.webp` | FIMI X8 Tele Max | `control` | <https://www.fimi.com/fimi-x8-tele-max.html> | FIMI | Permiso de publicación pendiente (ver nota 9) |
| `drones-fimi-x8-tele-max-camara.webp` | FIMI X8 Tele Max | `camara` | <https://www.fimi.com/fimi-x8-tele-max.html> | FIMI | Permiso de publicación pendiente (ver nota 9) |
| `motos-niu-nqi-sport-frente.webp` | NIU NQi Sport | `frente` | <https://france.niu.com/collections/best-selling-collection/products/nqi-sport> | NIU | Permiso de publicación pendiente (ver nota 10) |
| `motos-niu-nqi-sport-lateral.webp` | NIU NQi Sport | `lateral` | <https://france.niu.com/collections/best-selling-collection/products/nqi-sport> | NIU | Permiso de publicación pendiente (ver nota 10) |
| `motos-starker-thunder-1500-frente.webp` | Starker Thunder 1500 | `frente` | <https://www.auteco.com.co/moto-electrica-starker-thunder-1500/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `motos-starker-thunder-1500-lateral.webp` | Starker Thunder 1500 | `lateral` | <https://www.auteco.com.co/moto-electrica-starker-thunder-1500/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `motos-starker-thunder-1500-trasera.webp` | Starker Thunder 1500 | `trasera` | <https://www.auteco.com.co/moto-electrica-starker-thunder-1500/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `motos-starker-cool-joy-frente.webp` | Starker Cool Joy | `frente` | <https://www.auteco.com.co/moto-electrica-starker-cooljoy/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `motos-starker-cool-joy-lateral.webp` | Starker Cool Joy | `lateral` | <https://www.auteco.com.co/moto-electrica-starker-cooljoy/p> | Starker | Permiso de publicación pendiente (ver nota 3) |
| `carros-renault-kwid-e-tech-frente.webp` | Renault Kwid E-Tech | `frente` | <https://prensa.renault.com.co/prensa/renault-anuncia-la-llegada-del-renault-kwid-e-tech-electrico-en-colombia/> | Renault | Permiso de publicación pendiente (ver nota 11) |
| `carros-renault-kwid-e-tech-trasera.webp` | Renault Kwid E-Tech | `trasera` | <https://www.renault.com.co/electricos/kwid-etech0/galeria.html> | Renault | Permiso de publicación pendiente (ver nota 11) |
| `carros-renault-kwid-e-tech-interior.webp` | Renault Kwid E-Tech | `interior` | <https://www.renault.com.co/electricos/kwid-etech0/galeria.html> | Renault | Permiso de publicación pendiente (ver nota 11) |
| `carros-renault-kwid-e-tech-tablero.webp` | Renault Kwid E-Tech | `tablero` | <https://www.renault.com.co/electricos/kwid-etech0/galeria.html> | Renault | Permiso de publicación pendiente (ver nota 11) |
| `carros-dacia-spring-2026-frente.webp` | Dacia Spring (nueva generación 2026) | `frente` | <https://media.dacia.com/new-dacia-spring-100-per-cent-electric-100-per-cent-dacia/?lang=eng> | Dacia; crédito fotográfico: Dacia Design/Recom Paris | Permiso de publicación pendiente (ver nota 12) |
| `carros-dacia-spring-2026-lateral.webp` | Dacia Spring (nueva generación 2026) | `lateral` | <https://media.dacia.com/new-dacia-spring-100-per-cent-electric-100-per-cent-dacia/?lang=eng> | Dacia; crédito fotográfico: Dacia Design/Recom Paris | Permiso de publicación pendiente (ver nota 12) |
| `carros-dacia-spring-2026-trasera.webp` | Dacia Spring (nueva generación 2026) | `trasera` | <https://media.dacia.com/new-dacia-spring-100-per-cent-electric-100-per-cent-dacia/?lang=eng> | Dacia; crédito fotográfico: Dacia Design/Recom Paris | Permiso de publicación pendiente (ver nota 12) |
| `accesorios-specialized-align-ii-mips-vista-1.webp` | Specialized Align II MIPS | `vista-1` | <https://www.specialized.com/us/en/align-ii/p/1000207992> | Specialized | Permiso de publicación pendiente (ver nota 13) |
| `accesorios-specialized-align-ii-mips-vista-2.webp` | Specialized Align II MIPS | `vista-2` | <https://www.specialized.com/us/en/align-ii/p/1000207992> | Specialized | Permiso de publicación pendiente (ver nota 13) |
| `accesorios-specialized-align-ii-mips-vista-3.webp` | Specialized Align II MIPS | `vista-3` | <https://www.specialized.com/us/en/align-ii/p/1000207992> | Specialized | Permiso de publicación pendiente (ver nota 13) |
| `accesorios-kryptonite-evolution-mini-7-vista-1.webp` | Kryptonite Evolution Mini-7 con cable Flex | `vista-1` | <https://www.kryptonitelock.com.co/producto/candado-para-bicicleta-evolution-series-mini-7-w-4-flex/> | Kryptonite | Permiso de publicación pendiente (ver nota 3) |
| `accesorios-specialized-stix-elite-2-headlight-vista-1.webp` | Specialized Stix Elite 2 Headlight | `vista-1` | <https://www.specialized.com/us/en/stix-elite-2-headlight/p/174109> | Specialized | Permiso de publicación pendiente (ver nota 13) |
| `accesorios-specialized-stix-elite-2-headlight-vista-2.webp` | Specialized Stix Elite 2 Headlight | `vista-2` | <https://www.specialized.com/us/en/stix-elite-2-headlight/p/174109> | Specialized | Permiso de publicación pendiente (ver nota 13) |

## Notas de licencia

Condiciones observadas en cada sitio al descargar las fotos (no equivalen a una licencia de publicación):

1. Derechos reservados; uso personal no comercial del sitio; sin licencia expresa de reutilización fotográfica. https://www.specialized.com/co/es/terms-of-use
2. Derechos de propiedad intelectual reservados; sin licencia de medios clara. https://giant-bicycles.com.co/terminos-y-condiciones
3. Sin términos visibles específicos de licencia fotográfica en la ficha consultada.
4. Sin términos visibles de licencia fotográfica en la ficha de producto consultada.
5. Sin licencia fotográfica específica visible en la ficha oficial. Descarga local de referencia; publicación o edición pendientes de aclarar con Xiaomi.
6. Sin licencia expresa de medios visible en las páginas oficiales consultadas.
7. Sin licencia fotográfica visible en producto; robots.txt excluye /policies/, por lo que no se consultó esa ruta.
8. Copyright © FIMI / All Rights Reserved. El enlace User agreement del sitio corporativo respondió 404; sin licencia específica visible. La carpeta oficial de materiales pide iniciar sesión y se omitió. La tienda store.fimi.com prohíbe copiar sin permiso, por lo que no se usaron sus imágenes.
9. Copyright © FIMI / All Rights Reserved. El enlace User agreement del sitio corporativo respondió 404; sin licencia específica visible. La carpeta de materiales pide iniciar sesión y se omitió. No se usaron imágenes de la tienda store.fimi.com, cuyos términos exigen permiso.
10. Sin licencia fotográfica visible en NIU Francia; NIU Colombia bloqueó robots.txt con HTTP 403.
11. La página legal permite copia estrictamente personal no comercial; otros usos/modificaciones requieren autorización previa. https://www.renault.com.co/legales.html
12. Prensa oficial. Crédito Dacia Design/Recom Paris. La información legal permite copias estrictamente personales y excluye otros usos sin autorización; conservar atribución. https://media.dacia.com/legal-information/?lang=eng . No se presenta como licencia para publicar el prototipo.
13. Derechos reservados; uso personal no comercial del sitio, sin licencia expresa de edición/publicación fotográfica. https://www.specialized.com/us/en/terms-of-use .

# Medios de la landing (fotos y videos)

La landing funciona sin ningún medio: cada espacio muestra un degradado de la
paleta. En `npm run dev` el degradado dice qué archivo falta. Cuando copias el
archivo con el nombre exacto en `public/`, aparece solo (no hay que tocar código).

Los textos y las rutas viven en `src/app/(cliente)/_landing/contenido.ts`.

## Videos (carpeta `public/video/`)

Cada video necesita tres archivos con el mismo nombre base:

| Archivo | Para qué |
| --- | --- |
| `<nombre>-1080.mp4` | Escritorio, 1920x1080 |
| `<nombre>-720.mp4` | Celular, 1280x720 |
| `<nombre>-poster.jpg` | Imagen que se ve mientras carga |

| Nombre base | Dónde sale | Qué grabar | Duración |
| --- | --- | --- | --- |
| `hero` | Marco grande bajo el titular | Una escena de ciudad con tus vehículos en movimiento | 6 a 10 s, en bucle |
| `recorrido` | Primer bloque de la sección horizontal | Entrega a domicilio o recorrido por la ciudad | 6 a 10 s, en bucle |
| `pedestal` | Sección a pantalla completa con fondo beige | Tu producto estrella girando o quieto sobre un fondo liso (como el vehículo en pedestal de la referencia) | 6 a 10 s, en bucle |

Reglas para que no pese: sin audio, plano que se pueda repetir sin salto
(el final empalma con el inicio), 1080p con peso de 4 a 8 MB y 720p de 2 a 3 MB.

Conversión con ffmpeg (desde la carpeta donde está tu `entrada.mp4`):

```powershell
ffmpeg -i entrada.mp4 -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 23 -preset slow -movflags +faststart hero-1080.mp4
ffmpeg -i entrada.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-720.mp4
ffmpeg -i entrada.mp4 -vf "scale=1920:-2" -frames:v 1 -q:v 3 hero-poster.jpg
```

Importante: GitHub no admite archivos de más de 100 MB. Mantén cada video bajo
10 MB; si necesitas más, se hospeda aparte y no en el repositorio.

## Fotos (carpeta `public/img/landing/`)

Formato `.jpg`, de 1600 px de ancho como máximo y de 150 a 400 KB cada una.

| Archivo | Dónde sale | Proporción |
| --- | --- | --- |
| `recorrido-1.jpg`, `recorrido-2.jpg`, `recorrido-3.jpg` | Fotos de la sección horizontal | Vertical, 3:4 |
| `palabra-atajo.jpg` (scooter/patineta) | Sección de palabras | Vertical, 3:4 |
| `palabra-domingo.jpg` (bicicleta) | Sección de palabras | Vertical, 3:4 |
| `palabra-escape.jpg` (moto) | Sección de palabras | Vertical, 3:4 |
| `palabra-trabajo.jpg` (auto eléctrico) | Sección de palabras | Vertical, 3:4 |
| `palabra-perspectiva.jpg` (dron) | Sección de palabras | Vertical, 3:4 |
| `comprar.jpg`, `alquilar.jpg` | Tarjetas de la sección verde oscuro | Cuadrada, 1:1 |
| `mantenimiento.jpg`, `domicilio.jpg` | Tarjetas de la sección salvia | Cuadrada, 1:1 |
| `catalogo.jpg` | Foto grande junto a la lista de categorías | Horizontal, 4:3 |
| `pie.jpg` | Cierre del pie de página (parte trasera de un vehículo sobre fondo oscuro, como la referencia) | Horizontal, 16:9, oscura |

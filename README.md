# Sitio web de Rolf Winser Vargas

Sitio estático publicado mediante GitHub Pages en **https://rolfwinser.cl/**.

## Publicación

1. Reemplazar en el repositorio los archivos por los contenidos de este paquete.
2. Confirmar los cambios mediante commit.
3. GitHub Pages publicará automáticamente la nueva versión.

No es necesario modificar Cloudflare, el dominio ni Search Console para actualizaciones normales del sitio.

## Archivos SEO principales

- `index.html`: metadatos, Open Graph y datos estructurados.
- `robots.txt`: acceso de rastreadores y ubicación del sitemap.
- `sitemap.xml`: URL canónica del sitio.
- `site.webmanifest`: identidad básica para navegadores y dispositivos.
- `404.html`: página personalizada para direcciones inexistentes.

## Recursos descargables y fotografías

- `recursos.html`: página de recursos gratuitos y formulario privado de solicitud por correo.
- `descarga.html`: página de confirmación que recibe el enlace individual enviado por correo.
- `assets/resources/`: archivos PDF disponibles para descarga.
- `assets/images/resources/`: vistas previas de los materiales.
- `assets/images/centro-naz/`: fotografías optimizadas para el carrusel del centro.

Para sumar un nuevo recurso, se debe incorporar el PDF, su imagen de portada, una nueva tarjeta en `recursos.html` y la referencia correspondiente en `sitemap.xml` cuando cambie la estructura de páginas.


## SEO release · 2026-09-07
- Se preservó la base visual, Analytics, recursos, descargas, fotografías, CNAME y datos de contacto.
- Se añadieron páginas estratégicas de servicio/local, hub de orientación, contenidos temáticos y landings indexables de recursos.
- Sitemap actualizado y enlazado interno ampliado.
- No se encontró una metaetiqueta `google-site-verification` en el ZIP recibido; no se añadió ni eliminó ninguna. Si Search Console usa verificación por DNS o Analytics, se mantiene sin cambios.

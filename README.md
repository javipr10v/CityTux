# CityTux

Aplicación web para que los ciudadanos de Tuxtla Gutiérrez reporten incidencias urbanas (baches, luminarias, fugas de agua, basura, inundaciones…), vean el mapa de reportes y se sumen a los de sus vecinos.

## Cómo ejecutarla

1. Abre esta carpeta en **VS Code** e instala la extensión **Live Server**.
2. Clic derecho en `index.html` → **Open with Live Server**.

> Usa Live Server (o cualquier servidor local); abrir el archivo con doble clic impide el GPS.

## Estructura

```
index.html        Estructura de la página y sprite de íconos
css/styles.css    Estilos y tokens de color
js/app.js         Navegación, mapa, formulario, comunidad
js/chatbot.js     Asistente
img/              Imágenes optimizadas (WebP)
tools/            prepare_images.py: prepara las imágenes desde los originales
docs/             Decisiones de diseño IHC
```

## Créditos

Foto del Parque Central: Jovanny Esteban Moreno. Mapa © colaboradores de OpenStreetMap.

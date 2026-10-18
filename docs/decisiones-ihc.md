# CityTux · Decisiones de diseño IHC (Fase 2)

Proyecto de Interfaces Humano-Computadora · Octubre de 2026

Este documento registra **qué se decidió, por qué y cómo se verificó**. Cada decisión se puede rastrear al código (`css/styles.css`, `js/app.js`, `index.html`).

## 1. Contexto de uso

- **Usuarios:** ciudadanos de Tuxtla Gutiérrez que reportan incidencias urbanas (baches, luminarias, fugas, basura, inundaciones…).
- **Dispositivos:** celular en la calle (sol fuerte, prisa, una sola mano) y computadora en casa u oficina.
- **Tarea principal:** reportar un problema en pocos pasos. **Secundarias:** ver el mapa, sumarse a reportes de vecinos y consultar el estado de los propios.
- **Implicaciones de diseño:** alto contraste, objetivos táctiles grandes, texto corto, ilustraciones que se reconozcan de un vistazo y un solo llamado a la acción por pantalla.
- **Estado:** todavía no se han hecho pruebas con usuarios reales (ver sección 9).

## 2. Psicología del color

> Las asociaciones de color (azul = confianza, etc.) son **convenciones culturales frecuentes, no leyes**. Lo que sí es medible es el contraste y la legibilidad; por eso cada color se justifica también con datos (sección 8).

| Rol | Color | Hex | Justificación |
|---|---|---|---|
| Marca y estructura | Azul marino | `#0f2a4a` | Asociado con institución, seriedad y confianza (muy usado en sitios públicos). Sale del cielo nocturno de la foto principal (`#0C1E30`, `#144F85`). |
| Interacción secundaria | Azul | `#1d4ed8` | Estados activos, enlaces y "Sumarse". Se percibe como "algo que se puede tocar". |
| Acción principal | Naranja quemado | `#c2410c` | Complementario del azul: máximo contraste de matiz, transmite energía y acción. Conecta con los techos rojos de la catedral y las luces cálidas de la foto. **Regla: un solo botón naranja por pantalla.** |
| Fondo | Gris azulado claro | `#f6f7fb` | Neutro frío que descansa la vista y deja destacar el contenido. |
| Urgencia Alta / Media / Baja | Rojo / ámbar / verde | `#d92d20` / `#b86e00` / `#238a50` | Metáfora del semáforo, ya conocida. Tonos oscurecidos para cumplir contraste. |
| Estado Resuelto | Verde oscuro | `#1B6B3A` | Reservado a "éxito"; no se usa como color de marca. |

**Decisiones clave**

1. **Un color, un significado.** Se eliminaron los 8 colores por categoría que había antes: el rojo de "Basura" chocaba con el rojo de "urgencia Alta". Ahora la categoría se identifica por su ilustración y su texto.
2. **Nunca solo color (WCAG 1.4.1).** Cada nivel de urgencia y estado lleva ícono y texto; los pines del mapa llevan una letra (A, M, B). Así lo entienden también las personas con daltonismo rojo-verde.
3. **Alternativas evaluadas:** A (azul confianza: segura pero genérica) y B (verde ciudad: el verde de marca se confundiría con "Resuelto"). Se eligió la **C (marino y naranja)** por armonizar con las fotos y dar jerarquía clara.

## 3. Metáforas

| Elemento | Metáfora | Por qué funciona |
|---|---|---|
| Pin del mapa | Lugar exacto del problema | Convención universal de mapas. |
| Semáforo (rojo/ámbar/verde) | Urgencia | El usuario ya sabe qué significa cada color. |
| "Sumarse" | Respaldo vecinal, como firmar una petición | Convierte un reporte individual en un problema colectivo. |
| Stepper de 4 pasos | Recorrido con progreso visible | Reduce la incertidumbre: se sabe cuánto falta. |
| Ilustraciones de categoría | Objeto real (grifo, bote, lámpara) | Se reconoce más rápido que una palabra o un ícono abstracto. |
| Tarjetas de zonas con fotos de Tuxtla | Lugares propios de la ciudad | Identidad local: la app se siente hecha para Tuxtla. |
| Asistente (burbuja con pin) | Ayuda ubicada | Une "conversación" con "lugar", que es el tema de la app. |

## 4. Estándares y normas aplicadas

### 4.1 WCAG 2.2, nivel AA

| Criterio | Qué se hizo | Evidencia |
|---|---|---|
| 1.1.1 Contenido no textual | Fotos de zonas con `alt` descriptivo; íconos decorativos con `alt=""` | `js/app.js` (ZONES) |
| 1.4.1 Uso del color | Ícono + texto en urgencias y estados; letra en pines | Pruebas e2e |
| 1.4.3 Contraste mínimo | Todos los pares de texto ≥ 4.5:1 | Sección 8 |
| 1.4.11 Contraste no textual | Pines y anillo de foco ≥ 3:1 | Sección 8 |
| 2.1.1 Teclado | Controles nativos (`button`, `a`); el selector de fotos es alcanzable con Tab y muestra foco; el chat se cierra con Esc y devuelve el foco | Pruebas e2e |
| 2.4.1 Evitar bloques | Enlace "Saltar al contenido" | `index.html` |
| 2.4.2 Título de página | `document.title` cambia en cada vista | Pruebas e2e |
| 2.4.3 Orden del foco | Tras navegar, el foco pasa al título de la vista | Pruebas e2e |
| 2.4.7 Foco visible | Anillo de 3 px (azul; blanco sobre fondos oscuros) | `css/styles.css` |
| 2.5.8 Tamaño del objetivo | Todos los controles ≥ 24×24 px en móvil | Pruebas e2e |
| 3.1.1 Idioma | `lang="es"` | `index.html` |
| 4.1.2 Nombre, función, valor | `aria-pressed`, `aria-current`, `aria-expanded`, `aria-label` | Pruebas e2e |
| 4.1.3 Mensajes de estado | `role="status"` (avisos), `role="alert"` (errores), `role="log"` (chat) | `index.html` |

Además se respeta `prefers-reduced-motion` (sin animaciones para quien lo pide).

### 4.2 ISO 9241

- **ISO 9241-11 (usabilidad):** eficacia, eficiencia y satisfacción para usuarios y metas específicas. Se tradujo en: reportar en 4 pasos (eficiencia), validaciones que evitan reportes inútiles (eficacia) y un aspecto cuidado y propio (satisfacción).
- **ISO 9241-210 (diseño centrado en el ser humano):** proceso iterativo de entender el contexto, especificar requisitos, diseñar y evaluar. Este documento cubre las tres primeras etapas; la **evaluación con usuarios reales queda pendiente**.

### 4.3 Heurísticas de Nielsen

| Heurística | Aplicación en CityTux |
|---|---|
| Visibilidad del estado | Stepper, avisos tras cada acción, estado de cada reporte con ícono |
| Relación con el mundo real | Ilustraciones de objetos reales, semáforo |
| Control y libertad | Botón "Atrás", quitar fotos, "Sumado" reversible, cerrar el chat con Esc |
| Consistencia y estándares | Tokens de color únicos, mismo patrón de chips y tarjetas |
| Prevención de errores | Pin obligatorio, límite de 20 km al centro, máximo 4 fotos |
| Reconocimiento antes que recuerdo | Ícono + texto en cada categoría y urgencia |
| Flexibilidad y eficiencia | Tocar una categoría en Inicio lleva al formulario con el tipo ya elegido; sugerencias rápidas en el chat |
| Diseño estético y minimalista | Un solo botón naranja por pantalla; fondos neutros |
| Diagnóstico y recuperación de errores | Mensajes de error concretos ("Ese punto queda fuera de Tuxtla Gutiérrez…") |
| Ayuda y documentación | Asistente integrado, con enlaces a las acciones |

## 5. Estrategias de diseño

- **Jerarquía visual:** un único llamado a la acción en naranja; lo secundario en azul o contorno.
- **Gestalt:** proximidad (ícono junto a su etiqueta), similitud (todas las tarjetas de categoría iguales), continuidad (stepper en línea).
- **Carga cognitiva:** formulario dividido en 4 pasos cortos; urgencia con 3 opciones; texto breve.
- **Imágenes con propósito:** la foto del hero evoca "ciudad propia"; el oscurecimiento garantiza legibilidad del texto.

**Modelo de tareas y navegación**

```
Inicio ─┬─ Reportar: tipo → urgencia → descripción → ubicación (mapa) → evidencia → confirmar → Mis reportes
        ├─ Mapa: filtrar por urgencia → ver detalle de un reporte
        ├─ Comunidad: filtrar → sumarse / ver en mapa
        └─ Mis reportes: filtrar por estado
Asistente (disponible en todas las vistas)
```

## 6. Diseño detallado

- **Tipografía:** DM Sans (400, 500, 700), con respaldo del sistema.
- **Tokens CSS** (`:root`): `--navy`, `--blue`, `--blue-soft`, `--accent`, `--bg`, `--ink`, `--muted`, `--alta`, `--media`, `--baja`.
- **Componentes:** botón (primario/contorno/cristal), chip, badge de urgencia, estado, tarjeta de categoría, publicación, elemento de lista, pin, mensaje de chat.
- **Responsive:** puntos de quiebre en 860 px (rejilla de 2 columnas, menú con desplazamiento) y 700 px (hero ligero).
- **Imágenes:** WebP, de unos 10 MB originales a unos 0.4 MB; hero de 1600 px en escritorio y 800 px en móvil; íconos con transparencia real.

## 7. Implementación y herramientas

- **Lenguajes:** HTML5, CSS3, JavaScript (sin frameworks).
- **Mapas:** Leaflet + OpenStreetMap (cargado con integridad SRI).
- **Control de versiones:** Git y GitHub. **Editor:** VS Code con Live Server.
- **Imágenes:** `tools/prepare_images.py` (Python, Pillow).
- **Pruebas:** 37 pruebas automáticas de extremo a extremo en Chromium (Playwright).
- **Despliegue (Fase 3):** Firebase Hosting, Firestore y Authentication en el plan gratuito.

## 8. Verificación

### Contraste de texto (WCAG 1.4.3, mínimo 4.5:1)

| Par de colores | Texto/elemento | Fondo | Contraste | Mínimo | Resultado |
|---|---|---|---|---|---|
| Texto principal sobre fondo | `#0F2A4A` | `#F6F7FB` | 13.52:1 | 4.5:1 | Cumple |
| Texto principal sobre tarjeta | `#0F2A4A` | `#FFFFFF` | 14.48:1 | 4.5:1 | Cumple |
| Texto secundario sobre fondo | `#55627A` | `#F6F7FB` | 5.75:1 | 4.5:1 | Cumple |
| Texto secundario sobre tarjeta | `#55627A` | `#FFFFFF` | 6.15:1 | 4.5:1 | Cumple |
| Blanco sobre botón principal (naranja) | `#FFFFFF` | `#C2410C` | 5.18:1 | 4.5:1 | Cumple |
| Blanco sobre azul (Sumarse activo, mensajes propios) | `#FFFFFF` | `#1D4ED8` | 6.70:1 | 4.5:1 | Cumple |
| Azul sobre azul suave (menú y pestaña activos) | `#1D4ED8` | `#E6EDFF` | 5.72:1 | 4.5:1 | Cumple |
| Blanco sobre marino (encabezados, pie) | `#FFFFFF` | `#0F2A4A` | 14.48:1 | 4.5:1 | Cumple |
| Texto claro sobre marino (estadísticas, pie) | `#C3D3F7` | `#0F2A4A` | 9.64:1 | 4.5:1 | Cumple |
| Chip Alta | `#B42318` | `#FDECEA` | 5.75:1 | 4.5:1 | Cumple |
| Chip Media | `#8A5300` | `#FFF3D6` | 5.74:1 | 4.5:1 | Cumple |
| Chip Baja | `#1B6B3A` | `#E3F5EA` | 5.77:1 | 4.5:1 | Cumple |
| Estado Pendiente | `#4A5568` | `#ECEFF4` | 6.53:1 | 4.5:1 | Cumple |
| Estado En proceso | `#1D4ED8` | `#E6EDFF` | 5.72:1 | 4.5:1 | Cumple |
| Estado Resuelto | `#1B6B3A` | `#E3F5EA` | 5.77:1 | 4.5:1 | Cumple |
| Paso completado del formulario | `#1B6B3A` | `#F6F7FB` | 6.11:1 | 4.5:1 | Cumple |

### Contraste no textual (WCAG 1.4.11, mínimo 3:1)

| Par de colores | Texto/elemento | Fondo | Contraste | Mínimo | Resultado |
|---|---|---|---|---|---|
| Pin Alta sobre blanco | `#D92D20` | `#FFFFFF` | 4.83:1 | 3:1 | Cumple |
| Pin Media sobre blanco | `#B86E00` | `#FFFFFF` | 3.99:1 | 3:1 | Cumple |
| Pin Baja sobre blanco | `#238A50` | `#FFFFFF` | 4.35:1 | 3:1 | Cumple |
| Anillo de foco (azul) sobre blanco | `#1D4ED8` | `#FFFFFF` | 6.70:1 | 3:1 | Cumple |
| Anillo de foco (blanco) sobre marino | `#FFFFFF` | `#0F2A4A` | 14.48:1 | 3:1 | Cumple |

### Colores anteriores (Fase 1), para comparar

| Par de colores | Texto/elemento | Fondo | Contraste | Mínimo | Resultado |
|---|---|---|---|---|---|
| Texto secundario anterior sobre fondo | `#6B7590` | `#F5F6FA` | 4.25:1 | 4.5:1 | No cumplía |
| Urgencia Media anterior sobre blanco | `#F0A020` | `#FFFFFF` | 2.15:1 | 3:1 | No cumplía |
| Urgencia Baja anterior sobre blanco | `#2FB36D` | `#FFFFFF` | 2.70:1 | 3:1 | No cumplía |

### Texto sobre la foto del hero

Medido sobre los píxeles reales detrás de cada línea de texto: peor caso **5.30:1** en escritorio y **5.43:1** en móvil (mínimo 4.5:1 para texto normal).

## 9. Pendiente y siguientes pasos

- **Pruebas de usabilidad** con unas 5 personas reales (ISO 9241-210, etapa de evaluación).
- **Arquitectura (Fase 3):** separar en capas (modelo de datos, vistas y servicios) al integrar Firebase.
- **Teclado en el mapa:** marcar el punto requiere ratón o toque; la alternativa actual es el botón "Mi ubicación" (GPS). Falta una búsqueda de dirección para elegir el punto solo con teclado.
- **Datos reales:** Firestore para reportes y Authentication para inicio de sesión.
- **Créditos de imágenes:** solo consta el autor de la foto del Parque Central. Falta documentar la procedencia del resto de fotos e íconos, y reemplazar los que tengan marca de agua antes de publicar abiertamente.
- **Coherencia de íconos:** el de baches es una fotografía y el resto son ilustraciones; conviene sustituirlo por una ilustración plana.

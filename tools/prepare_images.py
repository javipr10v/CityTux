#!/usr/bin/env python3
"""Prepara las imágenes de CityTux: recorta, quita fondos y las convierte a WebP ligero.

Uso:     python tools/prepare_images.py CARPETA_CON_ORIGINALES
Requiere: pip install pillow numpy
Los originales deben llamarse como en ORIGINALES (png). El resultado se escribe en img/.
Los íconos con fondo blanco/gris pasan a tener transparencia real; la lámpara y el
semáforo se acortan (su poste es uniforme) para que no se vean diminutos en un cuadro.
"""
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter, ImageOps

SRC = sys.argv[1] if len(sys.argv) > 1 else 'originales'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img')
ICONOS = ['bache', 'luminaria', 'fuga', 'basura', 'residuos', 'limpieza', 'transito', 'inundacion']
ICON_PX = 160          # lado mayor del ícono final (se muestra a ~56-80 px, con margen para pantallas retina)
ZONA_SIZE = (720, 340)  # tarjetas de zonas (2x de ~360x170)
ZONAS = {  # nombre: (centrado horizontal, centrado vertical) del recorte
    'zona-centro': (0.5, 0.42), 'zona-sumidero': (0.5, 0.45), 'zona-marimba': (0.5, 0.35)}


def abrir(nombre):
    return Image.open(os.path.join(SRC, nombre + '.png')).convert('RGB')


def quitar_fondo(im, claro=185, sat=22, global_=False):
    """Hace transparente el fondo casi blanco/gris conectado a los bordes (o todo el casi-blanco si global_)."""
    a = np.array(im).astype(int)
    h, w, _ = a.shape
    neutro = (a.max(2) - a.min(2) < sat) & (a.min(2) > claro)
    if global_:
        fondo = neutro
    else:
        fondo = np.zeros((h, w), bool)
        dq = deque()
        for x in range(w):
            for y in (0, h - 1):
                if neutro[y, x] and not fondo[y, x]:
                    fondo[y, x] = True
                    dq.append((y, x))
        for y in range(h):
            for x in (0, w - 1):
                if neutro[y, x] and not fondo[y, x]:
                    fondo[y, x] = True
                    dq.append((y, x))
        while dq:
            y, x = dq.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and neutro[ny, nx] and not fondo[ny, nx]:
                    fondo[ny, nx] = True
                    dq.append((ny, nx))
    alfa = Image.fromarray(((~fondo) * 255).astype('uint8'))
    alfa = alfa.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA')
    out.putalpha(alfa)
    return out.crop(alfa.point(lambda v: 255 if v > 40 else 0).getbbox())


def quitar_franja(im, desde, hasta):
    """Quita una franja vertical [desde, hasta) (fracciones de la altura) y une las dos mitades."""
    h = im.height
    a, b = int(h * desde), int(h * hasta)
    top, bottom = im.crop((0, 0, im.width, a)), im.crop((0, b, im.width, h))
    out = Image.new('RGBA', (im.width, top.height + bottom.height), (0, 0, 0, 0))
    out.paste(top, (0, 0))
    out.paste(bottom, (0, top.height))
    return out


def guardar(im, nombre, calidad):
    ruta = os.path.join(OUT, nombre)
    im.save(ruta, 'WEBP', quality=calidad, method=6)
    print(f'{nombre:24s} {im.width}x{im.height}  {os.path.getsize(ruta) / 1024:6.1f} KB')


os.makedirs(OUT, exist_ok=True)

hero = abrir('hero')
guardar(hero.resize((1600, round(1600 * hero.height / hero.width)), Image.LANCZOS), 'hero.webp', 66)
guardar(hero.resize((800, round(800 * hero.height / hero.width)), Image.LANCZOS), 'hero-800.webp', 66)

for nombre, centro in ZONAS.items():
    guardar(ImageOps.fit(abrir(nombre), ZONA_SIZE, Image.LANCZOS, centering=centro), nombre + '.webp', 74)

for nombre in ICONOS:
    ic = quitar_fondo(abrir(nombre), global_=(nombre == 'residuos'))
    if nombre == 'luminaria':
        ic = quitar_franja(ic, 0.36, 0.80)
    if nombre == 'transito':
        ic = quitar_franja(ic, 0.58, 0.88)
    ic.thumbnail((ICON_PX, ICON_PX), Image.LANCZOS)
    guardar(ic, f'icon-{nombre}.webp', 88)

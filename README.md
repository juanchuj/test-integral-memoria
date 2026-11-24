# Test Integral de Memoria

App web para que una familia haga seguimiento de la memoria y el pensamiento de una persona con pruebas de tamizaje reconocidas: **AD8**, **IQCODE** (versión española), **SAGE** y **Mini-Cog**. No da un diagnóstico: sirve para ver la tendencia en el tiempo y llevar información concreta al médico.

## Cómo se usa
- **Usuario familiar** (PIN de usuario): hace las pruebas, escribe el diario, ve el informe y exporta un respaldo JSON.
- **Administrador** (PIN de administrador): todo lo anterior, más importar respaldos, borrar personas u observaciones y revisar el contenido oficial.
- Los datos se guardan **solo en el dispositivo**. Después de cada prueba, el usuario exporta el JSON (Ajustes → Exportar JSON) y se lo envía al administrador, que lo importa. Al importar, los registros se unen por id, sin duplicarse.

## Seguridad
- Los textos y PDF oficiales tienen derechos de autor y **no están en el repositorio en claro**. Solo se publica `public/contenido.enc.json`, cifrado con AES-256-GCM.
- La llave de ese contenido está envuelta dos veces: una con el PIN de administrador y otra con el de usuario (PBKDF2-SHA256, 310.000 iteraciones). Los PIN no se guardan en ninguna parte.
- Use PIN de al menos 6 dígitos. Un PIN corto se puede adivinar por fuerza bruta con tiempo suficiente.
- Los resultados de las pruebas nunca salen del dispositivo, salvo en los JSON que el usuario exporte.

## Desarrollo
```bash
npm install
npm run dev        # servidor local
npm run build      # genera dist/
```

## Cambiar los PIN o actualizar los formularios
Los originales van en la carpeta `contenido/` (ignorada por git):
```
contenido/textos.json
contenido/pdfs/ad8.pdf, iq.pdf, mc.pdf, calif.pdf, sage1.pdf … sage4.pdf
```
Luego:
```bash
npm run cifrar -- --admin NUEVO_PIN_ADMIN --usuario NUEVO_PIN_USUARIO
git add public/contenido.enc.json && git commit -m "Actualizar contenido cifrado" && git push
```
Al cambiar los PIN, cada dispositivo debe volver a entrar con el PIN nuevo. Los datos de las pruebas no se pierden.

## Publicación
Cada `push` a `main` construye y publica la app con GitHub Actions. En el repositorio: **Settings → Pages → Source: GitHub Actions**.

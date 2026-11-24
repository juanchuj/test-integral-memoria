# Changelog

## v1.0.0 – Primera versión en GitHub
- App web (React + Tailwind + componentes shadcn, avisos con Sonner) publicada con GitHub Pages
- Pruebas AD8, IQCODE (versión española de 17 ítems), SAGE (formas 1 a 4, calificación ítem por ítem) y Mini-Cog (6 versiones de palabras)
- Acceso con PIN: administrador (acceso total) y usuario familiar (pruebas, diario, informe, personas y respaldo)
- Textos y formularios oficiales cifrados con AES-256-GCM; la llave se abre solo con uno de los PIN (PBKDF2-SHA256, 310.000 iteraciones)
- Datos guardados solo en el dispositivo; exportar e importar en JSON con unión por id, sin duplicados
- Tablero de tendencias, diario de observaciones, informe descargable para el médico y prompt para evaluación con IA
- Bienvenida "Cómo funciona", modo claro y oscuro, diseño adaptado a celular

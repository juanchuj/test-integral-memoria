# Changelog

## v1.1.0 – Revisión de puntajes y experiencia de uso
- IQCODE: cortes según la literatura (validación española 3,27–3,31; corte recomendado para versiones cortas 3,44). Zona de alerta 3,31–3,43 y alerta desde 3,44 (antes 3,6)
- AD8: interpretación con el texto de la guía oficial (0–1 no descarta etapa muy temprana; 2 o más indica otras evaluaciones) y opción de que responda la propia persona si no hay informante
- SAGE: registro opcional de las 8 preguntas sin puntaje del formulario (autocrítica, antecedentes, equilibrio, derrames, ánimo, personalidad, actividades diarias); aparecen en el informe y en el prompt
- Mini-Cog: aviso a los 3 minutos del dibujo del reloj, como indica la guía
- Las pruebas en curso se conservan aunque se recargue la página o se bloquee el celular
- AD8 e IQCODE avanzan solos a la siguiente pregunta sin responder
- Exportar respaldo directamente desde la ventana de resultado, con aviso para el usuario familiar
- El administrador puede borrar un resultado mal registrado (con confirmación)
- Prompt de IA sin datos fijos de una persona y con lenguaje neutro
- Botones de PDF con texto largo ya no se salen de la pantalla en celular

## v1.0.0 – Primera versión en GitHub
- App web (React + Tailwind + componentes shadcn, avisos con Sonner) publicada con GitHub Pages
- Pruebas AD8, IQCODE (versión española de 17 ítems), SAGE (formas 1 a 4, calificación ítem por ítem) y Mini-Cog (6 versiones de palabras)
- Acceso con PIN: administrador (acceso total) y usuario familiar (pruebas, diario, informe, personas y respaldo)
- Textos y formularios oficiales cifrados con AES-256-GCM; la llave se abre solo con uno de los PIN (PBKDF2-SHA256, 310.000 iteraciones)
- Datos guardados solo en el dispositivo; exportar e importar en JSON con unión por id, sin duplicados
- Tablero de tendencias, diario de observaciones, informe descargable para el médico y prompt para evaluación con IA
- Bienvenida "Cómo funciona", modo claro y oscuro, diseño adaptado a celular

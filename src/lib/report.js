import { T, ORDER, NIV, interp, esc, fmt, hoy, nf, detalle, chartSVG, lines, DEF, SAGE_SC, sageMax, edad, npLista } from './domain'

const byTipo = (res, t) => res.filter((r) => r.tipo === t)

export function informeHTML(p, res, notas) {
  const n = [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const css = `body{font:15px/1.5 "Atkinson Hyperlegible",Arial,sans-serif;color:#15202b;max-width:900px;margin:24px auto;padding:0 16px}h1{font-size:26px;margin:0;color:#0f4c5c}h2{font-size:18px;margin:24px 0 8px;color:#0f4c5c}.mut{color:#566270}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #d5e0e3;vertical-align:top}th{color:#566270}.num{text-align:right;white-space:nowrap}.ok{color:#1f7a6c;font-weight:700}.gris{color:#b07800;font-weight:700}.alerta{color:#c23b4f;font-weight:700}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.n{border-top:1px solid #d5e0e3;padding:6px 0}@media print{body{margin:0}}`
  const filas = [...res].reverse().map((x) => { const t = T[x.tipo], i = interp(x.tipo, x.puntaje); return `<tr><td style="white-space:nowrap">${fmt(x.fecha)}</td><td>${t.n}</td><td class="num">${nf(x.puntaje, t.dec)} / ${t.max}</td><td class="${i[0]}">${NIV[i[0]]}</td><td>${esc(detalle(x))}</td></tr>` }).join('')
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe de chequeo de memoria – ${esc(p.nombre)}</title><style>${css}</style></head><body>
<h1>Informe de chequeo de memoria</h1>
<p><b>${esc(p.nombre)}</b>${p.nac ? ` · año de nacimiento ${esc(p.nac)}` : ''}${p.estudio ? ` · ${esc(p.estudio)} años de estudio` : ''}${p.nota ? ` · ${esc(p.nota)}` : ''}<br><span class="mut">Generado el ${fmt(hoy())}. Pruebas de tamizaje aplicadas por la familia; no constituyen un diagnóstico.</span></p>
<h2>Tendencias</h2><div class="g">${ORDER.map((k) => `<div><b>${T[k].n}</b><br>${chartSVG(byTipo(res, k), T[k], 420, 140)}</div>`).join('')}</div>
<h2>Resultados</h2>${res.length ? `<table><thead><tr><th>Fecha</th><th>Prueba</th><th class="num">Puntaje</th><th>Interpretación</th><th>Detalle</th></tr></thead><tbody>${filas}</tbody></table>` : '<p>Sin resultados registrados.</p>'}
<h2>Diario de observaciones</h2>${n.length ? n.map((x) => `<div class="n"><b>${fmt(x.fecha)} · ${esc(x.area)}</b>${x.obs ? ` <span class="mut">(${esc(x.obs)})</span>` : ''}<br>${esc(x.texto)}</div>`).join('') : '<p>Sin observaciones.</p>'}
<h2>Rangos de referencia</h2><p class="mut">AD8: 0–1 cognición normal; 2 o más, posible deterioro. IQCODE (versión española de 17 ítems): promedio de 3,31 a 3,43 zona de alerta (cortes de la validación española); 3,44 o más supera el corte recomendado para versiones cortas. SAGE: 17 o más se considera normal (hoja oficial); en los estudios de validación 15–16 corresponde a deterioro leve y ≤ 14 a demencia. Mini-Cog: menor de 3 es el corte para detección de demencia; menor de 4 si se desea mayor sensibilidad.</p>
</body></html>`
}

export function informeTexto(p, res, notas) {
  const n = [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return `INFORME DE CHEQUEO DE MEMORIA – ${p.nombre}\nGenerado: ${fmt(hoy())}\n\nRESULTADOS\n${[...res].reverse().map((x) => `${fmt(x.fecha)} · ${T[x.tipo].n}: ${nf(x.puntaje, T[x.tipo].dec)}/${T[x.tipo].max} · ${NIV[interp(x.tipo, x.puntaje)[0]]} · ${detalle(x)}`).join('\n') || 'Sin resultados'}\n\nDIARIO\n${n.map((x) => `${fmt(x.fecha)} · ${x.area}: ${x.texto}`).join('\n') || 'Sin observaciones'}`
}

export function promptIA(p, res, notas, cfg, iniciales) {
  const nom = iniciales ? p.nombre.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + '.').join('') : p.nombre
  const ed = edad(p), ad8i = lines(cfg.ad8_items), ad8o = lines(cfg.ad8_opts || DEF.ad8_opts), iqi = lines(cfg.iq_items), iqo = lines(cfg.iq_opts || DEF.iq_opts)
  const n = [...notas].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const bloque = (r) => {
    const t = T[r.tipo], e = r.extra || {}
    let s = `### ${t.n} · ${fmt(r.fecha)} · puntaje ${nf(r.puntaje, t.dec)}/${t.max} (${NIV[interp(r.tipo, r.puntaje)[0]]})\n`
    if (r.tipo === 'ad8' || r.tipo === 'iqcode') {
      const it = r.tipo === 'ad8' ? ad8i : iqi, op = r.tipo === 'ad8' ? ad8o : iqo
      s += `Informante: ${r.inf || 'no indicado'}${r.tipo === 'iqcode' ? ` · suma ${e.suma ?? '—'} · promedio ${nf(r.puntaje, 2)}` : ''}\n`
      ;(r.respuestas || []).forEach((v, i) => { s += `- ${i + 1}. ${it[i] || 'Ítem ' + (i + 1)} → ${v == null ? 'sin respuesta' : op[v] || v}\n` })
    }
    if (r.tipo === 'sage') {
      s += `Forma ${e.forma}${e.min ? ` · tardó ${e.min} min` : ''}\n`
      if (e.items) SAGE_SC.forEach((i) => { s += `- ${i.g}: ${e.items[i.id]} de ${sageMax(i, e.forma)}\n` })
      const np = npLista(e.np); if (np.length) s += `Preguntas sin puntaje (respuestas de la persona):\n${np.map((x) => `- ${x}`).join('\n')}\n`
    }
    if (r.tipo === 'minicog') {
      const w = (lines(cfg.mc_lists)[e.version - 1] || '').split(/[,;]/).map((x) => x.trim())
      s += `Versión de palabras ${e.version} (${w.join(', ')}) · recordó ${e.palabras}/3${e.recordadas ? ` (${w.filter((_, i) => e.recordadas[i]).join(', ') || 'ninguna'})` : ''} · reloj ${e.reloj}/2 (${e.reloj === 2 ? 'normal' : 'anormal'})\n`
    }
    return s
  }
  return `# Evaluación integrada de tamizaje cognitivo y plan de cuidado

## Tu rol
Actúa como un equipo clínico formado por un neurólogo cognitivo, un geriatra y un neuropsicólogo, que le explica los resultados a una familia en Colombia. Escribe en español claro y cálido, sin jerga innecesaria. Usa la búsqueda web para respaldar cada recomendación con fuentes actuales y confiables.

## Límites importantes
- Son pruebas de **tamizaje** aplicadas por la familia, no un diagnóstico. No diagnostiques; estima el nivel de preocupación y explica qué falta para un diagnóstico.
- Si los datos son insuficientes o contradictorios, dilo y explica por qué.
- No inventes enlaces, estudios ni videos. Incluye solo fuentes que hayas verificado con la búsqueda y que estén disponibles hoy. Si no encuentras un recurso en español, dilo.
- Distingue entre evidencia fuerte, moderada y preliminar.

## Persona evaluada
- Identificación: ${nom}
- Edad: ${ed ? ed + ' años' : 'no indicada'}
- Años de estudio: ${p.estudio || 'no indicado'}
- Antecedentes y notas de la familia: ${p.nota || 'ninguna'}
- País: Colombia. Ten en cuenta el sistema de salud colombiano (EPS, remisiones) al recomendar pasos.

## Pruebas aplicadas y rangos de referencia
- AD8 (informante, 8 ítems): 0–1 cognición normal; 2 o más, posible deterioro.
- IQCODE versión española corta de Del Ser, Morales y Bermejo (informante, ${iqi.length || 17} ítems, escala 1–5 comparando con hace 10 años): se reportan suma y promedio. La app usa como zona de alerta un promedio de 3,31 a 3,43 y como alerta 3,44 o más.
- SAGE (autoadministrada, 0–22): 17 o más se considera normal.
- Mini-Cog (0–5): corte < 3 para detección de demencia; < 4 cuando se busca mayor sensibilidad.

## Resultados (del más antiguo al más reciente)
${res.map(bloque).join('\n') || 'Sin resultados registrados.'}

## Diario de observaciones de la familia
${n.map((x) => `- ${fmt(x.fecha)} · ${x.area}: ${x.texto}`).join('\n') || 'Sin observaciones.'}

## Lo que necesito que entregues
1. **Resumen ejecutivo** (5 a 8 líneas): qué muestran los datos y nivel de preocupación (bajo, moderado o alto) con su justificación.
2. **Interpretación por prueba y en conjunto**: tendencia en el tiempo, concordancia entre lo que reportan los familiares (AD8, IQCODE) y el desempeño de la persona (SAGE, Mini-Cog), dominios más afectados (memoria, orientación, función ejecutiva, lenguaje, función diaria), y factores que pueden alterar los puntajes (escolaridad, ánimo, audición, visión, sueño, medicamentos).
3. **Qué hacer con el médico**: especialista al que debe ir, exámenes que conviene pedir (evaluación neuropsicológica completa, laboratorios para causas reversibles, neuroimagen, biomarcadores en sangre como p-tau217 y su disponibilidad real en Colombia), una lista de preguntas para llevar a la consulta y señales de alarma que justifican consulta urgente.
4. **Plan para prevenir o ralentizar**: basado en el informe 2024 de la Comisión Lancet sobre demencia (14 factores de riesgo modificables) y en ensayos de intervención multidominio como FINGER y U.S. POINTER. Convierte la evidencia en un plan semanal concreto y realista para esta persona: ejercicio, estimulación cognitiva, vida social, sueño, alimentación (dieta MIND o mediterránea), audición, visión, presión arterial, colesterol, glucosa, alcohol, tabaco y ánimo.
5. **Cómo hablar con la persona**: cómo plantear el tema con dignidad, cómo manejar la anosognosia si la hubiera, y cómo cuidar también a la pareja o cuidador principal.
6. **Planeación temprana en Colombia**: decisiones legales y financieras mientras la persona puede decidir plenamente (por ejemplo, la Ley 1996 de 2019 sobre apoyos y directivas anticipadas), explicado en términos sencillos.
7. **Recursos verificados**: entre 8 y 12 fuentes confiables con enlace (OMS, Alzheimer's Association en español, National Institute on Aging en español, Alzheimer's Disease International, la Comisión Lancet 2024, el Grupo de Neurociencias de Antioquia, asociaciones colombianas de Alzheimer), y de 3 a 6 **videos en español** de canales institucionales o médicos reconocidos sobre prevención, ejercicios y cuidado. Para cada recurso: título, enlace, de quién es y por qué vale la pena.
8. **Próximo seguimiento**: qué repetir, cuándo, y qué cambio en los puntajes debería motivar una nueva consulta.

Formato: títulos claros, tablas donde ayuden, frases cortas. Al final, la lista de todas las fuentes citadas con su enlace.`
}

export const SAGE_URL = 'https://wexnermedical.osu.edu/brain-spine-neuro/memory-disorders/sage/download-the-sage-test'

export const T = {
  sage: { k: 'sage', n: 'SAGE', quien: 'persona', sub: 'En papel, la hace la persona sola', dur: '15 min', min: 0, max: 22, dec: 0, bands: [[0, 14.5, 'alerta'], [14.5, 16.5, 'gris'], [16.5, 22, 'ok']] },
  minicog: { k: 'minicog', n: 'Mini-Cog', quien: 'persona', sub: 'La aplica un familiar a la persona', dur: '3 min', min: 0, max: 5, dec: 0, bands: [[0, 2.5, 'alerta'], [2.5, 3.5, 'gris'], [3.5, 5, 'ok']] },
  ad8: { k: 'ad8', n: 'AD8', quien: 'familiar', sub: 'La responde un familiar cercano', dur: '3 min', min: 0, max: 8, dec: 0, bands: [[0, 1.5, 'ok'], [1.5, 8, 'alerta']] },
  iqcode: { k: 'iqcode', n: 'IQCODE', quien: 'familiar', sub: 'La responde un familiar cercano', dur: '10 min', min: 1, max: 5, dec: 2, bands: [[1, 3.31, 'ok'], [3.31, 3.44, 'gris'], [3.44, 5, 'alerta']] },
}
export const ORDER = ['sage', 'minicog', 'ad8', 'iqcode']

export function interp(t, s) {
  if (t === 'ad8') return s >= 2 ? ['alerta', '2 o superior: es posible que exista deterioro cognitivo. Indica la necesidad de realizar otras evaluaciones.'] : ['ok', '0 a 1: cognición normal. Sugiere que la demencia es improbable, aunque no descarta un proceso en etapa muy temprana.']
  if (t === 'iqcode') return s >= 3.44 ? ['alerta', 'Promedio de 3,44 o más: supera el punto de corte recomendado para las versiones cortas del IQCODE. Conviene evaluación médica.'] : s >= 3.31 ? ['gris', 'Promedio entre 3,31 y 3,43: alcanza los cortes de la validación española (3,27 a 3,31). Repetir y comentar con el médico.'] : ['ok', 'Promedio menor de 3,31: por debajo de los puntos de corte; sin indicio de deterioro.']
  if (t === 'sage') return s <= 14 ? ['alerta', '14 o menos: por debajo de lo normal; en los estudios de validación, rango de demencia. Conviene evaluación médica.'] : s <= 16 ? ['gris', '15 a 16: por debajo de lo normal; en los estudios de validación, rango de deterioro cognitivo leve. Comentar con el médico.'] : ['ok', '17 o más: se considera normal según la hoja oficial.']
  if (t === 'minicog') return s <= 2 ? ['alerta', 'Menor de 3: valor de corte de la Mini-Cog para la detección de demencia. Conviene evaluación médica.'] : s === 3 ? ['gris', 'Menor de 4: con el corte de mayor sensibilidad, podría indicar la necesidad de evaluaciones adicionales.'] : ['ok', '4 a 5: sin indicio de deterioro según la Mini-Cog.']
  return ['ok', '']
}
export const NIV = { ok: 'Sin indicio', gris: 'Zona de alerta', alerta: 'Alerta' }
export const AREAS = ['Memoria reciente', 'Orientación (tiempo o lugar)', 'Lenguaje', 'Juicio y decisiones', 'Dinero y trámites', 'Ánimo o conducta', 'Actividades diarias', 'Otro']
export const DEF = { ad8_opts: 'Sí, hay cambio\nNo, no hay cambio\nNo sé', iq_opts: '1. Mucho mejor\n2. Un poco mejor\n3. Sin cambios\n4. Un poco peor\n5. Mucho peor' }

const O10 = [[1, '1 = correcto'], [0, '0 = incorrecto']]
export const SAGE_SC = [
  { id: 'mes', g: '1. Orientación · Mes', o: O10 },
  { id: 'fecha', g: '1. Orientación · Fecha', o: [[2, '2 = exacta'], [1, '1 = 3 días'], [0, '0 = todo lo demás']] },
  { id: 'anio', g: '1. Orientación · Año', o: O10 },
  { id: 'img1', g: '2. Nombrar · Imagen 1', n: 'No es necesario que la ortografía sea correcta.', o: O10 },
  { id: 'img2', g: '2. Nombrar · Imagen 2', o: O10 },
  { id: 'sim', g: '3. Similitudes', n: 'No es necesario que se escriba sin errores ortográficos/gramaticales.', o: [[2, '2 = abstracto'], [1, '1 = concreto'], [0, '0 = todo lo demás']] },
  { id: 'c4', g: '4. Cálculo', o: O10 },
  { id: 'c5', g: '5. Cálculo', o: O10 },
  { id: 'fig', g: '7. Construcción · Figura en 3D', o: [[2, '2 = 3D, líneas paralelas dentro de los 10º y forma correcta'], [1, '1 = 3D pero las líneas no son paralelas dentro de los 10º o forma incorrecta por otro motivo'], [0, '0 = todo lo demás']] },
  { id: 'reloj', g: '8. Construcción · Reloj', n: '4 componentes: esfera del reloj, números del reloj (los 12 números en orden correcto en sentido horario y con posición de cuadrante aproximadamente correcta), posición de las manecillas (las manecillas en la hora correcta y deben estar unidas cerca del centro del reloj) y el tamaño de las manecillas (real o si se etiqueta correctamente).', o: [[2, '2 = 4 de 4 componentes correctos'], [1, '1 = 3 de 4 componentes correctos; uno de los tres componentes correctos debe ser la posición de las manecillas'], [0, '0 = todo lo demás']] },
  { id: 'flu', g: '9. Fluidez verbal', n: 'No es necesario que la ortografía sea correcta.', o: [[2, '2 = se indican 12 elementos diferentes'], [1, '1 = se indican 10 u 11 elementos diferentes'], [0, '0 = se indican 9 o menos elementos diferentes']] },
  { id: 'ras', g: '10. Ejecución · Rastros modificados', n: 'Un error es si dos elementos que deberían estar conectados no lo están, o si dos elementos que no deberían estar conectados, lo están.', o: [[2, '2 = perfecto o únicamente errores corregidos por la persona'], [1, '1 = 1 o 2 errores'], [0, '0 = más de 2 errores']] },
  { id: 'prob', g: '11. Ejecución · Resolución de problemas', o: (f) => f <= 2
    ? [[2, '2 = líneas correctas movidas o marcadas y diagrama final correcto'], [1, '1 = líneas correctas movidas o marcadas y sin diagrama final o líneas correctas movidas o marcadas pero el diagrama final es incorrecto o no hay líneas movidas o marcadas y el diagrama final es correcto'], [0, '0 = todo lo demás incluidas las líneas movidas o marcadas es incorrecto pero el diagrama final es correcto']]
    : [[2, '2 = líneas correctas tachadas y diagrama final correcto'], [1, '1 = líneas correctas tachadas y sin diagrama final o líneas correctas tachadas pero diagrama final incorrecto o no hay líneas tachadas y el diagrama final es correcto'], [0, '0 = Todo lo demás incluidas las líneas tachadas es incorrecto pero el diagrama final es correcto']] },
  { id: 'mem', g: '12. Memoria', o: (f) => f <= 2
    ? [[2, '2 = redacción exacta únicamente, nada adicional: “Terminé”'], [1, '1 = debe contener la palabra “terminar”: “Sí, terminé”, “terminado”, otros'], [0, '0 = todo lo demás']]
    : [[2, '2 = redacción exacta únicamente, nada adicional: “He finalizado”'], [1, '1 = debe contener la palabra “finalizar”: “Sí, he finalizado”, “Finalicé”, otros'], [0, '0 = todo lo demás']] },
]
const SN = [['si', 'Sí'], ['no', 'No']], SON = [['si', 'Sí'], ['ocasional', 'Solo ocasionalmente'], ['no', 'No']]
export const SAGE_NP = [
  { id: 'memoria', q: '¿Ha tenido algún problema con su memoria o razonamiento?', o: SON },
  { id: 'pariente', q: '¿Ha tenido algún pariente consanguíneo que haya tenido problemas con la memoria o el razonamiento?', o: SN },
  { id: 'equilibrio', q: '¿Tiene problemas de equilibrio?', o: SN },
  { id: 'derrame', q: '¿Alguna vez tuvo un derrame cerebral importante?', o: SN },
  { id: 'derrame_menor', q: '¿Un derrame cerebral minúsculo o sin importancia?', o: SN },
  { id: 'triste', q: '¿Actualmente se siente triste o deprimido?', o: SON },
  { id: 'personalidad', q: '¿Ha tenido algún cambio en su personalidad?', o: SN },
  { id: 'actividades', q: '¿Tiene más dificultades haciendo actividades diarias debido a problemas para pensar?', o: SN },
]
const NP_TXT = { si: 'Sí', no: 'No', ocasional: 'Solo ocasionalmente' }
export const npResumen = (np) => SAGE_NP.filter((i) => np?.[i.id] && np[i.id] !== 'no').map((i) => `${i.q.replace(/^¿|\?$/g, '')}: ${NP_TXT[np[i.id]]}`)
export const npLista = (np) => SAGE_NP.filter((i) => np?.[i.id]).map((i) => `${i.q} ${NP_TXT[np[i.id]]}`)
export const sOpts = (it, f) => (typeof it.o === 'function' ? it.o(f) : it.o)
export const sageMax = (it, f) => Math.max(...sOpts(it, f).map((o) => o[0]))
export function sageGrupos(items) {
  const g = {}
  SAGE_SC.forEach((i) => { const k = i.g.split(' · ')[0].replace(/^\d+\. /, ''); g[k] = (g[k] || 0) + (items[i.id] || 0) })
  return Object.entries(g).map(([k, v]) => `${k} ${v}`).join(', ')
}

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
export const hoy = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) }
export const fmt = (f) => { if (!f) return ''; const [y, m, d] = String(f).split('-'); return `${d}/${m}/${y}` }
export const lines = (t) => String(t || '').split('\n').map((s) => s.trim()).filter(Boolean)
export const nf = (v, d) => Number(v).toFixed(d).replace('.', ',')
export function mas6(f) { const d = new Date(f + 'T12:00'); d.setMonth(d.getMonth() + 6); return d.toISOString().slice(0, 10) }
export function edad(p) { const y = parseInt(p?.nac); return y > 1900 ? new Date().getFullYear() - y : null }
export const mcLists = (cfg) => lines(cfg.mc_lists).map((l) => l.split(/[,;]/).map((w) => w.trim()).filter(Boolean)).filter((l) => l.length === 3)

export function detalle(x) {
  const e = x.extra || {}
  if (x.tipo === 'ad8') return `Informante: ${x.inf || '—'}${e.noSabe ? ` · "No sé": ${e.noSabe}` : ''}`
  if (x.tipo === 'iqcode') return `Informante: ${x.inf || '—'} · ${e.respondidas} de ${e.total || 16} respondidas${e.suma ? ` · suma ${e.suma}` : ''}`
  if (x.tipo === 'sage') { const f = npResumen(e.np); return `Forma ${e.forma}${e.items ? ' · ' + sageGrupos(e.items) : e.raw != null ? ` · total ${e.raw}` : ''}${e.min ? ` · ${e.min} min` : ''}${f.length ? ' · Respondió sí: ' + f.join('; ') : ''}` }
  if (x.tipo === 'minicog') return `Versión ${e.version} · palabras ${e.palabras}/3 · reloj ${e.reloj}/2`
  return ''
}

/* gráfica como texto SVG (para el informe descargable) */
export function chartSVG(pts, t, W, H, colors) {
  const m = { l: 30, r: 14, t: 10, b: 24 }, iw = W - m.l - m.r, ih = H - m.t - m.b
  if (iw < 40 || ih < 30) return ''
  const col = colors || { ok: '#1f7a6c', gris: '#b07800', alerta: '#c23b4f', line: '#0f4c5c', mut: '#566270' }
  const y = (v) => m.t + ih - ((v - t.min) / (t.max - t.min)) * ih
  const ts = pts.map((p) => new Date(p.fecha + 'T12:00').getTime())
  const a = Math.min(...ts), b = Math.max(...ts)
  const x = (i) => (pts.length < 2 || a === b ? m.l + iw / 2 + (pts.length > 1 ? (i - (pts.length - 1) / 2) * Math.min(40, iw / pts.length) : 0) : m.l + ((ts[i] - a) / (b - a)) * iw)
  let s = t.bands.map(([f, to, n]) => `<rect x="${m.l}" y="${y(to)}" width="${iw}" height="${y(f) - y(to)}" fill="${col[n]}" opacity=".13"/>`).join('')
  s += [t.min, t.max].map((v) => `<text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end" fill="${col.mut}" font-size="11">${v}</text>`).join('')
  if (pts.length) {
    s += `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.puntaje).toFixed(1)).join(' ')}" fill="none" stroke="${col.line}" stroke-width="3" stroke-linejoin="round"/>`
    s += pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.puntaje)}" r="5" fill="${col[interp(t.k, p.puntaje)[0]]}" stroke="#fff" stroke-width="2"/>`).join('')
    s += `<text x="${m.l}" y="${H - 6}" fill="${col.mut}" font-size="11">${esc(fmt(pts[0].fecha))}</text>`
    if (pts.length > 1) s += `<text x="${W - m.r}" y="${H - 6}" text-anchor="end" fill="${col.mut}" font-size="11">${esc(fmt(pts[pts.length - 1].fecha))}</text>`
  } else s += `<text x="${m.l + iw / 2}" y="${m.t + ih / 2}" text-anchor="middle" fill="${col.mut}" font-size="12">Sin resultados</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`
}

import * as React from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader, OptionGroup, StickyBar, NivelBadge, PdfButton, Stopwatch, Step, Instr, Empty } from '@/components/parts'
import { NoPersona } from '@/views/Inicio'
import { T, interp, lines, DEF, hoy, nf, SAGE_URL, SAGE_SC, SAGE_NP, sOpts, mcLists } from '@/lib/domain'
import { cn } from '@/lib/utils'
import { FileWarning, Save, Loader2 } from 'lucide-react'

function FaltaTexto({ campo, n }) {
  const S = useStore()
  return (
    <Empty icon={FileWarning} title="Falta el texto oficial">
      El contenido cifrado de la app no trae el texto oficial de {campo}{n ? ` (${n} renglones)` : ''}. Quien administra la app debe volver a generar el archivo cifrado con ese texto.
    </Empty>
  )
}

function SaveButton({ ok, onSave }) {
  const [busy, setBusy] = React.useState(false)
  return (
    <Button size="lg" className="w-full sm:w-auto" disabled={!ok || busy} onClick={async () => { setBusy(true); try { await onSave() } catch (e) {} finally { setBusy(false) } }}>
      {busy ? <Loader2 className="animate-spin" /> : <Save />}Guardar resultado
    </Button>
  )
}

function ScoreLine({ text, nivel, sub }) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2"><b className="text-xl tabular-nums">{text}</b>{nivel && <NivelBadge n={nivel} />}</div>
      {sub}
    </div>
  )
}

function FechaField({ value, onChange, id }) {
  return <div className="space-y-2"><Label htmlFor={id}>Fecha</Label><Input id={id} type="date" value={value} max={hoy()} onChange={(e) => onChange(e.target.value)} /></div>
}

/* ---------------- AD8 e IQCODE ---------------- */
export function Questionnaire({ k, persona, draft, setDraft, save }) {
  const S = useStore()
  const isA = k === 'ad8', t = T[k], cfg = S.cfg
  const items = lines(cfg[isA ? 'ad8_items' : 'iq_items'])
  const opts = lines(cfg[isA ? 'ad8_opts' : 'iq_opts'] || DEF[isA ? 'ad8_opts' : 'iq_opts'])
  const need = isA ? 8 : items.length === 17 ? 17 : 16
  const desc = isA
    ? 'Lo llena un familiar que conozca bien a la persona (idealmente la pareja), sin que ella esté presente. Si no hay un familiar disponible, la puede responder la propia persona, calificando los cambios en sus capacidades.'
    : 'Lo llena un familiar que haya convivido con la persona en los últimos 10 años. Compara cómo está ahora con cómo era hace 10 años.'
  if (!persona) return <><PageHeader title={t.n} desc={desc} test={t} /><NoPersona /></>
  if (items.length !== need || opts.length !== (isA ? 3 : 5)) return <><PageHeader title={t.n} desc={desc} test={t} /><FaltaTexto campo={t.n} n={need} /></>
  const ans = draft.ans && draft.ans.length === need ? draft.ans : Array(need).fill(null)
  const fecha = draft.fecha || hoy()
  const answered = ans.filter((v) => v !== null).length
  let puntaje, ok, txt, extra
  if (isA) {
    puntaje = ans.filter((v) => v === 0).length; ok = answered === need
    txt = `${puntaje} de 8 cambios`; extra = { noSabe: ans.filter((v) => v === 2).length }
  } else {
    const v = ans.filter((x) => x !== null), suma = v.reduce((s, x) => s + x + 1, 0), m = v.length ? suma / v.length : 0
    puntaje = Math.round(m * 100) / 100; ok = v.length >= need - 2
    txt = v.length ? `Promedio ${nf(m, 2)} · suma ${suma}` : 'Sin respuestas'; extra = { respondidas: v.length, total: need, suma }
  }
  const nivel = ok ? interp(k, puntaje)[0] : null
  const setAns = (i, j) => {
    const a = [...ans]; const nueva = a[i] === null; a[i] = j; setDraft({ ans: a })
    const sig = a.findIndex((v, n) => n > i && v === null)
    if (nueva && sig > -1) setTimeout(() => document.getElementById(`${k}-q${sig}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }), 120)
  }
  return (
    <div>
      <PageHeader title={t.n} desc={desc} test={t} />
      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
          <FechaField id="f-fecha" value={fecha} onChange={(v) => setDraft({ fecha: v })} />
          <div className="space-y-2"><Label htmlFor="f-inf">Quién responde</Label><Input id="f-inf" value={draft.inf || ''} placeholder={isA ? 'Nombre y relación, o "la propia persona"' : 'Nombre y relación'} onChange={(e) => setDraft({ inf: e.target.value })} /></div>
          {cfg[isA ? 'ad8_instr' : 'iq_instr'] && <div className="sm:col-span-2"><Instr>{cfg[isA ? 'ad8_instr' : 'iq_instr']}</Instr></div>}
          <div className="sm:col-span-2"><PdfButton href={isA ? S.pdf.ad8 : S.pdf.iq}>Formulario oficial (PDF)</PdfButton></div>
        </CardContent>
      </Card>
      <ol className="space-y-3">
        {items.map((q, i) => (
          <li key={i} id={`${k}-q${i}`} className="scroll-mt-24">
            <Card className={cn('transition-colors', ans[i] !== null && 'border-primary/40')}>
              <CardContent className="space-y-4 pt-5 sm:pt-6">
                <p className="text-lg leading-snug sm:text-xl"><span className="mr-2 font-bold text-primary">{i + 1}.</span>{q}</p>
                <OptionGroup label={`Pregunta ${i + 1}`} options={opts.map((o, j) => [j, o])} value={ans[i]} onChange={(j) => setAns(i, j)} />
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
      <StickyBar>
        <ScoreLine text={txt} nivel={nivel} sub={<div className="flex max-w-xs items-center gap-3"><Progress value={(answered / need) * 100} /><span className="whitespace-nowrap text-sm text-muted-foreground">{answered}/{need}</span></div>} />
        <SaveButton ok={ok} onSave={() => save({ tipo: k, fecha, puntaje, respuestas: ans, inf: draft.inf || '', extra })} />
      </StickyBar>
    </div>
  )
}

/* ---------------- SAGE ---------------- */
export function Sage({ persona, res, draft, setDraft, save }) {
  const S = useStore()
  const t = T.sage
  const desc = 'Prueba en papel que la persona hace sola, con tinta y sin ayuda. El tiempo promedio es de 15 minutos. Las 4 formas son equivalentes: use una distinta cada vez.'
  if (!persona) return <><PageHeader title="SAGE" desc={desc} test={t} /><NoPersona /></>
  const usadas = res.filter((r) => r.tipo === 'sage').map((r) => r.extra?.forma)
  const sug = [1, 2, 3, 4].find((f) => !usadas.includes(f)) || ((usadas[usadas.length - 1] || 0) % 4) + 1
  const forma = draft.forma || sug, sc = draft.sc || {}, fecha = draft.fecha || hoy()
  const k = SAGE_SC.filter((i) => sc[i.id] != null).length, total = SAGE_SC.reduce((a, i) => a + (sc[i.id] || 0), 0), ok = k === SAGE_SC.length
  return (
    <div>
      <PageHeader title="SAGE" desc={desc} test={t} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-6 pt-5 sm:pt-6">
            <Step n={1} title="Imprimir la forma">
              <p>La app sugiere la <b>forma {sug}</b>: {usadas.length ? 'es la siguiente en la rotación.' : 'aún no se ha usado.'}</p>
              <div className="flex flex-wrap gap-2">{[1, 2, 3, 4].map((i) => <PdfButton key={i} href={S.pdf['sage' + i]} variant={i === sug ? 'default' : 'outline'}>Forma {i}</PdfButton>)}</div>
            </Step>
            <Step n={2} title="Aplicar">
              <Instr>Informe al examinado que hay cuatro páginas para completar. No debe haber calendarios ni relojes disponibles durante la prueba. No responda preguntas específicas. Simplemente diga, “Haga lo mejor que pueda”.</Instr>
              <Stopwatch />
            </Step>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-6 pt-5 sm:pt-6">
            <Step n={3} title="Datos de la aplicación">
              <div className="grid gap-4 sm:grid-cols-3">
                <FechaField id="s-fecha" value={fecha} onChange={(v) => setDraft({ fecha: v })} />
                <div className="space-y-2"><Label htmlFor="s-forma">Forma usada</Label>
                  <Select value={String(forma)} onValueChange={(v) => setDraft({ forma: +v })}><SelectTrigger id="s-forma"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4].map((f) => <SelectItem key={f} value={String(f)}>Forma {f}{usadas.includes(f) ? ' (ya usada)' : ''}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label htmlFor="s-min">Minutos (opcional)</Label><Input id="s-min" type="number" inputMode="numeric" min="0" value={draft.min ?? ''} onChange={(e) => setDraft({ min: e.target.value })} /></div>
              </div>
              <p className="text-[15px] text-muted-foreground">No reciben puntuación: información demográfica, autocrítica, antecedentes familiares, síntomas motrices, de derrame cerebral y de depresión, cambios de personalidad y habilidades funcionales. Igual conviene comentarlas con el médico.</p>
              <div className="flex flex-wrap gap-2"><PdfButton href={S.pdf.calif}>Instrucciones oficiales de puntuación</PdfButton><Button asChild variant="link" className="px-0"><a href={SAGE_URL} target="_blank" rel="noopener">Sitio oficial de Ohio State</a></Button></div>
            </Step>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle>Preguntas sin puntaje (opcional)</CardTitle><CardDescription className="text-base">Copie lo que la persona marcó en la primera página. No suman puntos, pero el ánimo, un derrame o los antecedentes pueden afectar el resultado y le sirven al médico.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {SAGE_NP.map((q) => (
            <div key={q.id} className="space-y-2">
              <p className="text-[17px]">{q.q}</p>
              <OptionGroup label={q.q} options={q.o} value={(draft.np || {})[q.id]} onChange={(v) => setDraft((d) => ({ ...d, np: { ...(d.np || {}), [q.id]: (d.np || {})[q.id] === v ? undefined : v } }))} />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="mb-4 mt-10 flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Calificar ítem por ítem</h2>
        <p className="text-muted-foreground">Criterios de la hoja oficial de puntuación. La memoria (ítem 6) se califica en el ítem 12.</p>
      </div>
      <ol className="space-y-3">
        {SAGE_SC.map((it) => (
          <li key={it.id}>
            <Card className={cn('transition-colors', sc[it.id] != null && 'border-primary/40')}>
              <CardContent className="space-y-3 pt-5 sm:pt-6">
                <p className="text-lg font-bold text-primary">{it.g}</p>
                {it.n && <p className="text-[15px] text-muted-foreground">{it.n}</p>}
                <OptionGroup label={it.g} options={sOpts(it, forma)} value={sc[it.id]} onChange={(v) => setDraft((d) => ({ ...d, sc: { ...(d.sc || {}), [it.id]: v } }))} />
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
      <StickyBar>
        <ScoreLine text={`Total ${total} / 22`} nivel={ok ? interp('sage', total)[0] : null} sub={<div className="flex max-w-xs items-center gap-3"><Progress value={(k / SAGE_SC.length) * 100} /><span className="whitespace-nowrap text-sm text-muted-foreground">{k}/{SAGE_SC.length} ítems</span></div>} />
        <SaveButton ok={ok} onSave={() => save({ tipo: 'sage', fecha, puntaje: total, extra: { forma: +forma, items: { ...sc }, min: draft.min ? +draft.min : null, np: Object.fromEntries(Object.entries(draft.np || {}).filter(([, v]) => v)) } })} />
      </StickyBar>
    </div>
  )
}

/* ---------------- Mini-Cog ---------------- */
export function MiniCog({ persona, res, draft, setDraft, save }) {
  const S = useStore()
  const t = T.minicog
  const desc = 'Unos 3 minutos. La aplica un familiar con la app; la persona evaluada no debe ver la pantalla.'
  if (!persona) return <><PageHeader title="Mini-Cog" desc={desc} test={t} /><NoPersona /></>
  const L3 = mcLists(S.cfg)
  if (!L3.length) return <><PageHeader title="Mini-Cog" desc={desc} test={t} /><FaltaTexto campo="Mini-Cog: listas de palabras" /></>
  const usadas = res.filter((r) => r.tipo === 'minicog').map((r) => r.extra?.version)
  const def = Math.max(0, L3.findIndex((_, i) => !usadas.includes(i + 1)))
  const v = draft.v ?? def, w = L3[v] || L3[0], rec = draft.rec || [false, false, false], reloj = draft.reloj, fecha = draft.fecha || hoy()
  const pal = rec.filter(Boolean).length, ok = reloj != null, total = pal + (reloj || 0)
  const cfg = S.cfg
  return (
    <div>
      <PageHeader title="Mini-Cog" desc={desc} test={t} />
      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:pt-6">
          <FechaField id="m-fecha" value={fecha} onChange={(x) => setDraft({ fecha: x })} />
          <div className="space-y-2"><Label htmlFor="m-v">Versión de palabras</Label>
            <Select value={String(v)} onValueChange={(x) => setDraft({ v: +x, rec: [false, false, false] })}><SelectTrigger id="m-v"><SelectValue /></SelectTrigger><SelectContent>{L3.map((_, i) => <SelectItem key={i} value={String(i)}>Versión {i + 1}{usadas.includes(i + 1) ? ' (ya usada)' : ''}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card><CardContent className="pt-5 sm:pt-6"><Step n={1} title="Registro de tres palabras">
          <Instr>{cfg.mc_instr_words}</Instr>
          <div className="flex flex-wrap gap-3">{w.map((x) => <span key={x} className="rounded-lg border-2 border-primary/30 bg-secondary px-6 py-3 text-3xl font-bold sm:text-4xl">{x}</span>)}</div>
        </Step></CardContent></Card>
        <Card><CardContent className="pt-5 sm:pt-6"><Step n={2} title="Dibujo de reloj">
          <Instr>{cfg.mc_instr_clock}</Instr>
          <PdfButton href={S.pdf.mc}>Imprimir página del círculo (PDF, pág. 2)</PdfButton>
          <Stopwatch limite={180} />
          <div className="space-y-3 pt-2"><p className="font-bold">Calificación del reloj</p><Instr>{cfg.mc_clock_score}</Instr>
            <OptionGroup label="Calificación del reloj" options={[[2, 'Normal · 2 puntos'], [0, 'Anormal · 0 puntos']]} value={reloj} onChange={(x) => setDraft({ reloj: x })} />
          </div>
        </Step></CardContent></Card>
        <Card><CardContent className="pt-5 sm:pt-6"><Step n={3} title="Memoria de tres palabras">
          <Instr>{cfg.mc_instr_recall}</Instr>
          <p className="text-[15px] text-muted-foreground">1 punto por cada palabra que recuerde espontáneamente sin pistas.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {w.map((x, i) => (
              <label key={x} htmlFor={'rec' + i} className={cn('flex min-h-14 cursor-pointer items-center gap-3 rounded-md border-2 px-4 text-xl transition-colors', rec[i] ? 'border-primary bg-secondary font-bold' : 'border-input hover:bg-accent')}>
                <Checkbox id={'rec' + i} checked={rec[i]} onCheckedChange={(c) => { const r = [...rec]; r[i] = !!c; setDraft({ rec: r }) }} />{x}
              </label>
            ))}
          </div>
        </Step></CardContent></Card>
      </div>
      <StickyBar>
        <ScoreLine text={ok ? `Total ${total} / 5` : `Palabras ${pal}/3 · falta calificar el reloj`} nivel={ok ? interp('minicog', total)[0] : null} sub={<span className="text-sm text-muted-foreground">Palabras (0 a 3) + reloj (0 o 2)</span>} />
        <SaveButton ok={ok} onSave={() => save({ tipo: 'minicog', fecha, puntaje: total, extra: { version: v + 1, palabras: pal, reloj, recordadas: rec } })} />
      </StickyBar>
    </div>
  )
}

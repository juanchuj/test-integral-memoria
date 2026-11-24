import * as React from 'react'
import { useStore, saveFile, copyText } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader, PdfButton } from '@/components/parts'
import { hoy, lines, uid } from '@/lib/domain'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Save, Download, Copy, Upload, Pencil, X, CheckCircle2, AlertCircle, ShieldCheck, Trash2, LockKeyhole } from 'lucide-react'

const EMPTY = { id: '', nombre: '', nac: '', estudio: '', nota: '' }
const slug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()

function Revision({ k, label, n }) {
  const S = useStore()
  const c = lines(S.cfg[k]).length
  const ok = n ? c === n : c > 0
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <span>{label}</span>
      <span className={cn('flex items-center gap-1 whitespace-nowrap text-sm font-bold', ok ? 'text-success' : 'text-destructive')}>{ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}{n ? `${c} de ${n}` : ok ? 'Cargado' : 'Falta'}</span>
    </li>
  )
}

export default function Ajustes({ pickPersona, persona }) {
  const S = useStore()
  const [p, setP] = React.useState(EMPTY)
  const [borrar, setBorrar] = React.useState(null)
  const fileRef = React.useRef(null)
  const nombreArchivo = () => `test-memoria-${slug(persona?.nombre) || 'datos'}-${hoy()}.json`

  const guardarPersona = async (e) => {
    e.preventDefault()
    const nombre = p.nombre.trim(); if (!nombre) { toast.error('Escriba el nombre.'); return }
    const id = p.id || uid()
    try {
      await S.put('personas', id, { nombre, nac: p.nac.trim(), estudio: p.estudio.trim(), nota: p.nota.trim() })
      toast.success(p.id ? 'Persona actualizada.' : 'Persona agregada.')
      if (!p.id && !S.personas.length) pickPersona(id)
      setP(EMPTY)
    } catch (e) {}
  }
  const importar = async (file) => {
    try {
      const j = JSON.parse(await file.text())
      const n = S.importar(j)
      toast.success('Respaldo importado.', { description: `${n.nuevos} registros nuevos y ${n.actualizados} actualizados.` })
      if (!persona && j.personas?.[0]?.id) pickPersona(String(j.personas[0].id))
    } catch (e) { toast.error('El archivo no es un respaldo válido.', { description: 'Use un JSON exportado desde esta app.' }) }
  }
  const borrarPersona = async () => {
    const x = borrar; setBorrar(null)
    for (const r of S.resultados.filter((r) => r.persona === x.id)) await S.del('resultados', r.id)
    for (const n of S.notas.filter((n) => n.persona === x.id)) await S.del('notas', n.id)
    await S.del('personas', x.id)
    toast.success(`${x.nombre} fue borrado junto con sus resultados.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" desc={S.own ? 'Usted entró como administrador: tiene acceso a todo.' : 'Personas y respaldo de los datos de este dispositivo.'}>
        <div><Badge variant={S.own ? 'default' : 'secondary'} className="text-sm"><ShieldCheck className="h-4 w-4" />{S.own ? 'Administrador' : 'Usuario familiar'}</Badge></div>
      </PageHeader>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personas</CardTitle><CardDescription>La persona evaluada y quienes hagan la prueba de línea base.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={guardarPersona} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="p-nombre">Nombre</Label><Input id="p-nombre" value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="p-nac">Año de nacimiento</Label><Input id="p-nac" inputMode="numeric" value={p.nac} onChange={(e) => setP({ ...p, nac: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="p-estudio">Años de estudio</Label><Input id="p-estudio" inputMode="numeric" value={p.estudio} onChange={(e) => setP({ ...p, estudio: e.target.value })} /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="p-nota">Nota (relación, antecedentes familiares)</Label><Input id="p-nota" value={p.nota} onChange={(e) => setP({ ...p, nota: e.target.value })} /></div>
              </div>
              <div className="flex flex-wrap gap-2"><Button type="submit"><Save />{p.id ? 'Actualizar persona' : 'Guardar persona'}</Button>{p.id && <Button type="button" variant="ghost" onClick={() => setP(EMPTY)}><X />Cancelar edición</Button>}</div>
            </form>
            {S.personas.length ? (
              <ul className="divide-y rounded-md border">
                {S.personas.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div><b>{x.nombre}</b><div className="text-sm text-muted-foreground">{[x.nac, x.nota].filter(Boolean).join(' · ')}</div></div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setP({ ...EMPTY, ...x })}><Pencil className="!size-4" />Editar</Button>
                      {S.own && <Button variant="ghost" size="sm" aria-label={`Borrar a ${x.nombre}`} onClick={() => setBorrar(x)}><Trash2 className="!size-4 text-muted-foreground" /></Button>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">Aún no hay personas.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Respaldo en JSON</CardTitle><CardDescription className="text-base">Los datos solo se guardan en este dispositivo. Exporte un JSON después de cada prueba y envíeselo a quien administra la app; al importarlo, los datos se unen sin duplicarse.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => saveFile(nombreArchivo(), JSON.stringify(S.exportar(), null, 1), 'Respaldo descargado.')}><Download />Exportar JSON</Button>
              <Button variant="outline" onClick={() => copyText(JSON.stringify(S.exportar()), 'Respaldo copiado.')}><Copy />Copiar</Button>
            </div>
            <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload />Importar JSON</Button>
            <div className="flex flex-wrap gap-2 pt-2 text-sm">
              <Badge variant="secondary">{S.personas.length} personas</Badge><Badge variant="secondary">{S.resultados.length} resultados</Badge><Badge variant="secondary">{S.notas.length} observaciones</Badge>
            </div>
            <p className="text-sm text-muted-foreground">El JSON no incluye los textos ni los formularios oficiales: solo personas, resultados y diario.</p>
          </CardContent>
        </Card>
      </div>
      {S.own && (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Contenido oficial cifrado</CardTitle><CardDescription>Textos y formularios que vienen en el archivo cifrado de la app.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <ul className="divide-y">
                <Revision k="ad8_items" label="AD8 · preguntas" n={8} />
                <Revision k="ad8_opts" label="AD8 · opciones" n={3} />
                <Revision k="iq_items" label="IQCODE · preguntas" n={17} />
                <Revision k="iq_opts" label="IQCODE · escala" n={5} />
                <Revision k="mc_lists" label="Mini-Cog · listas de palabras" n={6} />
                <Revision k="mc_clock_score" label="Mini-Cog · criterio del reloj" />
              </ul>
              <div className="flex flex-wrap gap-2">
                <PdfButton href={S.pdf.ad8}>AD8</PdfButton><PdfButton href={S.pdf.iq}>IQCODE</PdfButton><PdfButton href={S.pdf.mc}>Mini-Cog</PdfButton>
                {[1, 2, 3, 4].map((i) => <PdfButton key={i} href={S.pdf['sage' + i]}>SAGE {i}</PdfButton>)}<PdfButton href={S.pdf.calif}>SAGE puntuación</PdfButton>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-primary" />PIN y seguridad</CardTitle><CardDescription className="text-base">Los PIN no se guardan en ninguna parte: con ellos se cifran los textos y formularios oficiales.</CardDescription></CardHeader>
            <CardContent className="space-y-3 text-[15px]">
              <p>Para <b>cambiar los PIN</b>, en su computador, dentro del repositorio:</p>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[13px]">node scripts/cifrar.mjs --admin NUEVO_PIN --usuario NUEVO_PIN</pre>
              <p className="text-muted-foreground">Luego suba el archivo <code>public/contenido.enc.json</code> a GitHub. Los datos de las pruebas no se pierden, porque están en cada dispositivo.</p>
              <Button variant="outline" onClick={S.lock}><LockKeyhole />Cerrar sesión en este dispositivo</Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Dialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>¿Borrar a {borrar?.nombre}?</DialogTitle><DialogDescription>Se borran también sus resultados y observaciones de este dispositivo. Exporte un respaldo antes si lo necesita.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setBorrar(null)}>Cancelar</Button><Button variant="destructive" onClick={borrarPersona}><Trash2 />Borrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

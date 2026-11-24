import * as React from 'react'
import { useStore, saveFile, copyText } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader, TrendChart, NivelBadge } from '@/components/parts'
import { NoPersona } from '@/views/Inicio'
import { T, ORDER, interp, nf, fmt, hoy, detalle, edad } from '@/lib/domain'
import { informeHTML, informeTexto, promptIA } from '@/lib/report'
import { Download, Copy, Sparkles, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function Informe({ persona, res, notas }) {
  const S = useStore()
  const [ini, setIni] = React.useState(true)
  const [borrar, setBorrar] = React.useState(null)
  const prompt = React.useMemo(() => (persona ? promptIA(persona, res, notas, S.cfg, ini) : ''), [persona, res, notas, S.cfg, ini])
  const desc = 'Resumen de todas las pruebas y del diario. Descárguelo para imprimirlo o enviárselo al médico.'
  if (!persona) return <><PageHeader title="Informe para el médico" desc={desc} /><NoPersona /></>
  const ed = edad(persona)
  const ns = [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return (
    <div className="space-y-8">
      <PageHeader title="Informe para el médico" desc={desc}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => saveFile(`Informe memoria ${persona.nombre} ${hoy()}.html`, informeHTML(persona, res, notas), 'Informe descargado. Ábralo y use Imprimir.')}><Download />Descargar informe</Button>
          <Button variant="outline" onClick={() => copyText(informeTexto(persona, res, notas), 'Informe copiado como texto.')}><Copy />Copiar como texto</Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{persona.nombre}</CardTitle>
          <CardDescription>{[ed && `${ed} años`, persona.estudio && `${persona.estudio} años de estudio`, persona.nota].filter(Boolean).join(' · ') || 'Sin datos adicionales'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {ORDER.map((k) => <div key={k}><p className="mb-1 font-bold">{T[k].n}</p><TrendChart pts={res.filter((r) => r.tipo === k)} t={T[k]} height={140} /></div>)}
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold">Resultados</h3>
            {res.length ? (
              <Table>
                <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Prueba</TableHead><TableHead className="text-right">Puntaje</TableHead><TableHead>Interpretación</TableHead><TableHead className="min-w-[220px]">Detalle</TableHead>{S.own && <TableHead><span className="sr-only">Acciones</span></TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {[...res].reverse().map((x) => { const t = T[x.tipo], i = interp(x.tipo, x.puntaje); return (
                    <TableRow key={x.id}><TableCell className="whitespace-nowrap tabular-nums">{fmt(x.fecha)}</TableCell><TableCell className="whitespace-nowrap font-bold">{t.n}</TableCell><TableCell className="whitespace-nowrap text-right tabular-nums">{nf(x.puntaje, t.dec)} / {t.max}</TableCell><TableCell><NivelBadge n={i[0]} /></TableCell><TableCell className="text-muted-foreground">{detalle(x)}</TableCell>{S.own && <TableCell className="p-1"><Button variant="ghost" size="icon" aria-label={`Borrar resultado de ${t.n} del ${fmt(x.fecha)}`} onClick={() => setBorrar(x)}><Trash2 className="text-muted-foreground" /></Button></TableCell>}</TableRow>
                  ) })}
                </TableBody>
              </Table>
            ) : <p className="text-muted-foreground">Sin resultados registrados.</p>}
          </div>
          <div>
            <h3 className="mb-2 text-xl font-bold">Diario ({ns.length})</h3>
            {ns.length ? <ul className="divide-y">{ns.map((x) => <li key={x.id} className="flex gap-4 py-3"><span className="w-[92px] shrink-0 text-[15px] tabular-nums text-muted-foreground">{fmt(x.fecha)}</span><div><b className="text-sm text-primary">{x.area}</b><p>{x.texto}</p></div></li>)}</ul> : <p className="text-muted-foreground">Sin observaciones.</p>}
          </div>
        </CardContent>
      </Card>
      <Dialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>¿Borrar este resultado?</DialogTitle><DialogDescription>{borrar && `${T[borrar.tipo].n} del ${fmt(borrar.fecha)} · puntaje ${nf(borrar.puntaje, T[borrar.tipo].dec)}`}</DialogDescription></DialogHeader>
          <p>Úselo solo si el resultado quedó mal registrado. No se puede deshacer.</p>
          <DialogFooter><Button variant="outline" onClick={() => setBorrar(null)}>Cancelar</Button><Button variant="destructive" onClick={async () => { const b = borrar; setBorrar(null); await S.del('resultados', b.id); toast.success('Resultado borrado.') }}><Trash2 />Borrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><Sparkles className="h-6 w-6 text-primary" />Evaluación con IA</CardTitle>
          <CardDescription className="text-base">Copie este prompt y péguelo en <b className="text-foreground">Claude Opus 5.5</b> con la búsqueda web activada (o en modo Investigación) y en <b className="text-foreground">Gemini</b> con Deep Research, para comparar las dos respuestas. Incluye todos los resultados, las respuestas ítem por ítem y el diario.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3"><Checkbox id="ia-ini" checked={ini} onCheckedChange={(v) => setIni(!!v)} /><Label htmlFor="ia-ini" className="text-base font-normal">Usar solo las iniciales de la persona (recomendado)</Label></div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => copyText(prompt, 'Prompt copiado. Péguelo en Claude o Gemini.')}><Copy />Copiar prompt</Button>
            <Button variant="outline" onClick={() => saveFile(`Prompt evaluacion ${hoy()}.md`, prompt, 'Prompt descargado.')}><Download />Descargar (.md)</Button>
          </div>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md border bg-muted p-4 font-mono text-[13.5px] leading-relaxed">{prompt}</pre>
        </CardContent>
      </Card>
    </div>
  )
}

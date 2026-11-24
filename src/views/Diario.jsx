import * as React from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/parts'
import { NoPersona } from '@/views/Inicio'
import { AREAS, hoy, fmt, uid } from '@/lib/domain'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2 } from 'lucide-react'

export default function Diario({ persona, notas }) {
  const S = useStore()
  const [f, setF] = React.useState({ fecha: hoy(), area: AREAS[0], obs: '', texto: '' })
  const [busy, setBusy] = React.useState(false)
  const [borrar, setBorrar] = React.useState(null)
  const desc = 'Anote hechos concretos con fecha: qué pasó, dónde y un ejemplo. Esto es lo que más le sirve al neurólogo.'
  if (!persona) return <><PageHeader title="Diario de observaciones" desc={desc} /><NoPersona /></>
  const lista = [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.creado || '').localeCompare(a.creado || ''))
  const submit = async (e) => {
    e.preventDefault()
    if (!f.texto.trim()) { toast.error('Escriba qué pasó.'); return }
    setBusy(true)
    try {
      await S.put('notas', uid(), { persona: persona.id, fecha: f.fecha || hoy(), area: f.area, obs: f.obs.trim(), texto: f.texto.trim(), creado: new Date().toISOString() })
      setF((x) => ({ ...x, texto: '' })); toast.success('Observación agregada.')
    } catch (e) {} finally { setBusy(false) }
  }
  return (
    <div>
      <PageHeader title="Diario de observaciones" desc={desc} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card className="lg:sticky lg:top-4">
          <CardHeader><CardTitle>Nueva observación</CardTitle><CardDescription>Sobre {persona.nombre}.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="n-fecha">Fecha</Label><Input id="n-fecha" type="date" max={hoy()} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="n-area">Área</Label><Select value={f.area} onValueChange={(v) => setF({ ...f, area: v })}><SelectTrigger id="n-area"><SelectValue /></SelectTrigger><SelectContent>{AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="n-obs">Quién observa</Label><Input id="n-obs" placeholder="Nombre" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="n-texto">Qué pasó</Label><Textarea id="n-texto" placeholder="Ej.: preguntó tres veces en una hora a qué hora era la cita." value={f.texto} onChange={(e) => setF({ ...f, texto: e.target.value })} /></div>
              <Button type="submit" size="lg" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Plus />}Agregar observación</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{lista.length} {lista.length === 1 ? 'observación' : 'observaciones'}</CardTitle></CardHeader>
          <CardContent>
            {lista.length ? (
              <ul className="divide-y">
                {lista.map((x) => (
                  <li key={x.id} className="flex gap-4 py-4 first:pt-0">
                    <div className="w-[92px] shrink-0 pt-0.5 text-[15px] tabular-nums text-muted-foreground">{fmt(x.fecha)}</div>
                    <div className="flex-1"><div className="text-sm font-bold text-primary">{x.area}{x.obs ? <span className="font-normal text-muted-foreground"> · {x.obs}</span> : null}</div><p className="mt-1 whitespace-pre-wrap">{x.texto}</p></div>
                    {S.own && <Button variant="ghost" size="icon" aria-label="Borrar observación" onClick={() => setBorrar(x)}><Trash2 className="text-muted-foreground" /></Button>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">Aún no hay observaciones. Empiece con algo concreto que haya notado recientemente.</p>}
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>¿Borrar esta observación?</DialogTitle><DialogDescription>{borrar && `${fmt(borrar.fecha)} · ${borrar.area}`}</DialogDescription></DialogHeader>
          <p className="line-clamp-4">{borrar?.texto}</p>
          <DialogFooter><Button variant="outline" onClick={() => setBorrar(null)}>Cancelar</Button><Button variant="destructive" onClick={async () => { const b = borrar; setBorrar(null); try { await S.del('notas', b.id); toast.success('Observación borrada.') } catch (e) {} }}><Trash2 />Borrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

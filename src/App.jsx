import * as React from 'react'
import { useStore } from '@/lib/store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ResultDialog } from '@/components/parts'
import { HelpCircle, Home, NotebookPen, FileText, Settings, Brain, Loader2, LockKeyhole, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { uid } from '@/lib/domain'
import { toast } from 'sonner'
import Inicio from '@/views/Inicio'
import { Questionnaire, Sage, MiniCog } from '@/views/Tests'
import Diario from '@/views/Diario'
import Informe from '@/views/Informe'
import Ajustes from '@/views/Ajustes'

const VIEWS = ['inicio', 'sage', 'minicog', 'ad8', 'iqcode', 'diario', 'informe', 'ajustes']
const readHash = () => { const h = (location.hash || '').slice(1); return VIEWS.includes(h) ? h : 'inicio' }
function LockScreen() {
  const S = useStore()
  const [pin, setPin] = React.useState('')
  const [rec, setRec] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [err, setErr] = React.useState('')
  const enviar = async (e) => {
    e.preventDefault(); if (!pin) return
    setBusy(true); setErr('')
    try {
      const rol = await S.unlock(pin, rec)
      if (!rol) { setErr('PIN incorrecto. Intente de nuevo.'); setPin('') }
      else toast.success(rol === 'admin' ? 'Bienvenido. Entró como administrador.' : 'Bienvenidos.')
    } catch (e) { setErr('No se pudo abrir el contenido.') } finally { setBusy(false) }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero p-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary"><Brain className="h-8 w-8" /></div>
        <h1 className="text-[32px] font-bold leading-[1.05]">Test Integral de Memoria</h1>
        <p className="mt-2 text-lg text-muted-foreground">Ingrese su PIN para entrar.</p>
        {S.estado === 'error' ? (
          <div className="mt-6 flex gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4"><AlertTriangle className="h-5 w-5 shrink-0 text-destructive" /><p>No se pudo cargar el contenido de la app. Revise la conexión a internet y recargue la página.</p></div>
        ) : S.estado === 'cargando' ? (
          <div className="mt-6 flex items-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Cargando…</div>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" inputMode="numeric" autoComplete="off" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setErr('') }} className="h-14 text-center text-2xl tracking-[0.4em]" aria-invalid={!!err} aria-describedby="pin-err" />
              <p id="pin-err" className="min-h-6 text-[15px] font-bold text-destructive" role="alert">{err}</p>
            </div>
            <div className="flex items-center gap-3"><Checkbox id="rec" checked={rec} onCheckedChange={(v) => setRec(!!v)} /><Label htmlFor="rec" className="text-base font-normal">Recordar en este dispositivo</Label></div>
            <Button type="submit" size="lg" className="w-full" disabled={busy || !pin}>{busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Entrar</Button>
          </form>
        )}
      </div>
    </div>
  )
}

const ls = { get: (k) => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} } }

function NavLink({ v, cur, children, icon: Icon }) {
  const on = v === cur
  const ref = React.useRef(null)
  React.useEffect(() => { if (on && ref.current?.scrollIntoView) ref.current.scrollIntoView({ block: 'nearest', inline: 'center' }) }, [on])
  return (
    <a ref={ref} href={'#' + v} aria-current={on ? 'page' : undefined}
      className={cn('flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3.5 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hero-foreground sm:px-4',
        on ? 'bg-background text-primary' : 'text-hero-foreground/85 hover:bg-hero-foreground/10 hover:text-hero-foreground')}>
      {Icon && <Icon className="h-[18px] w-[18px]" />}{children}
    </a>
  )
}
function NavGroup({ label, children }) {
  return (
    <div className="flex shrink-0 flex-col border-x border-hero-foreground/20 px-1">
      <span className="px-3 pb-0.5 text-[12.5px] font-bold text-hero-foreground/75">{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  )
}

function Splash({ open, onClose }) {
  const [no, setNo] = React.useState(true)
  const steps = [
    ['Elija arriba a la persona evaluada.', 'Si no aparece, agréguela en Ajustes. Puede haber otros familiares como línea base, así nadie queda señalado: "nos hacemos el chequeo todos".'],
    ['Pruebas que hace la persona.', 'SAGE (en papel, unos 15 minutos, sola y sin ayuda) y Mini-Cog (3 minutos, la aplica un familiar). Los formularios se imprimen desde la app.'],
    ['Pruebas que responde un familiar.', 'AD8 e IQCODE. Las llena alguien que conozca bien a la persona, idealmente sin que ella esté presente.'],
    ['Diario.', 'Anote con fecha los hechos concretos que note: olvidos, desorientación, cambios de ánimo. Es lo que más le sirve al neurólogo.'],
    ['Repita cada 6 meses.', 'Una sola prueba dice poco; una caída sostenida dice mucho. El Inicio muestra la tendencia.'],
    ['Informe y respaldo.', 'Descargue el informe para el médico. Después de cada prueba, exporte el JSON en Ajustes y envíeselo a quien administra la app: los datos solo quedan en este dispositivo.'],
  ]
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose(no)}>
      <DialogContent className="max-w-2xl border-t-8 border-t-primary">
        <DialogHeader>
          <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"><Brain className="h-7 w-7" /></div>
          <DialogTitle className="text-3xl">Cómo funciona</DialogTitle>
          <DialogDescription className="text-lg">Esta app ayuda a la familia a seguir la memoria y el pensamiento con pruebas de tamizaje reconocidas. <b className="text-foreground">No da un diagnóstico</b>: sirve para ver la tendencia y llevar información concreta al médico.</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {steps.map(([b, t], i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground">{i + 1}</span>
              <p className="pt-0.5"><b>{b}</b> {t}</p>
            </li>
          ))}
        </ol>
        <p className="rounded-md bg-muted p-3 text-[15px] text-muted-foreground">Si alguna prueba sale en alerta, la recomendación es consultar con neurología y pedir una evaluación neuropsicológica completa.</p>
        <DialogFooter className="items-center sm:justify-between">
          <div className="flex items-center gap-3"><Checkbox id="sp-no" checked={no} onCheckedChange={(v) => setNo(!!v)} /><Label htmlFor="sp-no" className="text-base font-normal">No volver a mostrar al abrir</Label></div>
          <Button size="lg" onClick={() => onClose(no)}>Empezar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function App() {
  const S = useStore()
  const [view, setView] = React.useState(readHash)
  const [cur, setCur] = React.useState(() => ls.get('cm-persona'))
  const [allDrafts, setAllDrafts] = React.useState(() => { try { return JSON.parse(ls.get('test-integral-memoria-borradores') || '{}') } catch (e) { return {} } })
  React.useEffect(() => { ls.set('test-integral-memoria-borradores', JSON.stringify(allDrafts)) }, [allDrafts])
  const [result, setResult] = React.useState(null)
  const [splash, setSplash] = React.useState(() => ls.get('cm-splash') !== 'no')

  React.useEffect(() => { const f = () => { setView(readHash()); window.scrollTo(0, 0) }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  const go = (v) => { if (location.hash === '#' + v) { setView(v); window.scrollTo(0, 0) } else location.hash = v }

  const personas = React.useMemo(() => [...S.personas].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')), [S.personas])
  const persona = personas.find((p) => p.id === cur) || personas[0] || null
  const pid = persona?.id || null
  React.useEffect(() => { if (pid && pid !== cur) setCur(pid) }, [pid])
  const pickPersona = (id) => { setCur(id); ls.set('cm-persona', id) }
  const drafts = allDrafts[pid] || {}
  const setDrafts = (fn) => setAllDrafts((all) => ({ ...all, [pid]: fn(all[pid] || {}) }))

  const vista = view
  const res = React.useMemo(() => S.resultados.filter((r) => r.persona === pid).sort((a, b) => (a.fecha + (a.creado || '')).localeCompare(b.fecha + (b.creado || ''))), [S.resultados, pid])
  const notas = React.useMemo(() => S.notas.filter((n) => n.persona === pid), [S.notas, pid])

  const draft = (k) => drafts[k] || {}
  const setDraft = (k) => (upd) => setDrafts((d) => ({ ...d, [k]: typeof upd === 'function' ? upd(d[k] || {}) : { ...(d[k] || {}), ...upd } }))
  const saveResult = async (rec) => {
    const full = { ...rec, persona: pid, creado: new Date().toISOString() }
    await S.put('resultados', uid(), full)
    setDrafts((d) => { const n = { ...d }; delete n[rec.tipo]; return n })
    setResult(full)
  }
  const common = { persona, res, notas, go }
  const tprops = (k) => ({ ...common, draft: draft(k), setDraft: setDraft(k), save: saveResult })

  let body
  if (vista === 'inicio') body = <Inicio {...common} />
  else if (vista === 'ad8' || vista === 'iqcode') body = <Questionnaire key={vista + pid} k={vista} {...tprops(vista)} />
  else if (vista === 'sage') body = <Sage key={'sage' + pid} {...tprops('sage')} />
  else if (vista === 'minicog') body = <MiniCog key={'mc' + pid} {...tprops('minicog')} />
  else if (vista === 'diario') body = <Diario {...common} />
  else if (vista === 'informe') body = <Informe {...common} />
  else if (vista === 'ajustes') body = <Ajustes {...common} pickPersona={pickPersona} />

  if (S.estado !== 'abierto') return <LockScreen />

    return (
    <div className="min-h-screen">
      <header className="bg-hero text-hero-foreground">
        <div className="mx-auto max-w-[1240px] px-4 pt-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-hero-foreground/15"><Brain className="h-6 w-6" /></div>
              <div><div className="text-[24px] font-bold leading-none tracking-tight sm:text-[28px]">Test Integral de Memoria</div><div className="mt-1 flex items-center gap-1 text-[13px] font-bold text-hero-foreground/75"><ShieldCheck className="h-3.5 w-3.5" />{S.own ? 'Administrador' : 'Usuario familiar'}</div></div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Label htmlFor="persona" className="text-[15px] text-hero-foreground/85">Persona evaluada</Label>
              <Select value={pid || ''} onValueChange={pickPersona} disabled={!personas.length}>
                <SelectTrigger id="persona" className="h-11 w-full min-w-[200px] border-transparent bg-background text-foreground sm:w-[220px]"><SelectValue placeholder="Sin personas" /></SelectTrigger>
                <SelectContent>{personas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" className="h-11 border-hero-foreground/40 bg-transparent text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground" onClick={() => setSplash(true)}><HelpCircle />Cómo funciona</Button>
              <Button variant="ghost" size="icon" className="text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground" onClick={S.lock} aria-label="Cerrar sesión" title="Cerrar sesión"><LockKeyhole /></Button>
            </div>
          </div>
          <nav aria-label="Secciones" className="-mx-4 mt-5 flex items-end gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <NavLink v="inicio" cur={vista} icon={Home}>Inicio</NavLink>
            <NavGroup label="Las hace la persona"><NavLink v="sage" cur={vista}>SAGE</NavLink><NavLink v="minicog" cur={vista}>Mini-Cog</NavLink></NavGroup>
            <NavGroup label="Las responde un familiar"><NavLink v="ad8" cur={vista}>AD8</NavLink><NavLink v="iqcode" cur={vista}>IQCODE</NavLink></NavGroup>
            <NavLink v="diario" cur={vista} icon={NotebookPen}>Diario</NavLink>
            <NavLink v="informe" cur={vista} icon={FileText}>Informe</NavLink>
            <NavLink v="ajustes" cur={vista} icon={Settings}>Ajustes</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-4 pb-16 pt-8 sm:px-6">
        {body}
      </main>
      <Splash open={splash} onClose={(no) => { setSplash(false); ls.set('cm-splash', no ? 'no' : 'si') }} />
      <ResultDialog result={result} persona={persona} onClose={() => setResult(null)} go={go} />
    </div>
  )
}

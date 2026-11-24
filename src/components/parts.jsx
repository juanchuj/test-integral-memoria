import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { T, NIV, interp, nf, fmt, mas6 } from '@/lib/domain'
import { cn } from '@/lib/utils'
import { Play, RotateCcw, Pause, FileDown, User, Users, Clock, Download } from 'lucide-react'
import { useStore, saveFile } from '@/lib/store'
import { hoy } from '@/lib/domain'

export function NivelBadge({ n, className }) {
  return <Badge variant={n} className={className}>{NIV[n]}</Badge>
}

export function QuienBadge({ quien }) {
  return quien === 'persona'
    ? <Badge variant="secondary"><User className="h-3.5 w-3.5" />La hace la persona</Badge>
    : <Badge variant="secondary"><Users className="h-3.5 w-3.5" />La responde un familiar</Badge>
}

export function PageHeader({ title, desc, children, test }) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {test && <div className="flex flex-wrap items-center gap-2"><QuienBadge quien={test.quien} /><Badge variant="outline"><Clock className="h-3.5 w-3.5" />{test.dur}</Badge></div>}
      <h1 className="text-[32px] font-bold leading-[1.05] sm:text-[40px]">{title}</h1>
      {desc && <p className="max-w-[68ch] text-lg text-muted-foreground">{desc}</p>}
      {children}
    </div>
  )
}

const COL = { ok: 'hsl(var(--success))', gris: 'hsl(var(--warning))', alerta: 'hsl(var(--destructive))' }
export function TrendChart({ pts, t, height = 150, className }) {
  const ref = React.useRef(null)
  const [W, setW] = React.useState(0)
  React.useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const H = height, m = { l: 30, r: 16, t: 12, b: 26 }, iw = W - m.l - m.r, ih = H - m.t - m.b
  const y = (v) => m.t + ih - ((v - t.min) / (t.max - t.min)) * ih
  const ts = pts.map((p) => new Date(p.fecha + 'T12:00').getTime())
  const a = Math.min(...ts), b = Math.max(...ts)
  const x = (i) => (pts.length < 2 || a === b ? m.l + iw / 2 + (pts.length > 1 ? (i - (pts.length - 1) / 2) * Math.min(40, iw / pts.length) : 0) : m.l + ((ts[i] - a) / (b - a)) * iw)
  return (
    <div ref={ref} className={cn('relative w-full', className)} style={{ height: H }}>
      {W > 60 && (
        <svg width={W} height={H} role="img" aria-label={`Tendencia de ${t.n}`} className="absolute inset-0">
          {t.bands.map(([f, to, n]) => <rect key={n + f} x={m.l} y={y(to)} width={iw} height={y(f) - y(to)} fill={COL[n]} opacity={0.12} rx={4} />)}
          {[t.min, t.max].map((v) => <text key={v} x={m.l - 7} y={y(v) + 4} textAnchor="end" fontSize="12" fill="hsl(var(--muted-foreground))">{v}</text>)}
          {pts.length > 0 ? (
            <>
              <path d={pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.puntaje).toFixed(1)).join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => <circle key={p.id || i} cx={x(i)} cy={y(p.puntaje)} r="6.5" fill={COL[interp(t.k, p.puntaje)[0]]} stroke="hsl(var(--card))" strokeWidth="2.5"><title>{`${fmt(p.fecha)}: ${nf(p.puntaje, t.dec)}`}</title></circle>)}
              <text x={m.l} y={H - 7} fontSize="12" fill="hsl(var(--muted-foreground))">{fmt(pts[0].fecha)}</text>
              {pts.length > 1 && W > 300 && <text x={W - m.r} y={H - 7} textAnchor="end" fontSize="12" fill="hsl(var(--muted-foreground))">{fmt(pts[pts.length - 1].fecha)}</text>}
            </>
          ) : <text x={m.l + iw / 2} y={m.t + ih / 2 + 5} textAnchor="middle" fontSize="14" fill="hsl(var(--muted-foreground))">Sin resultados todavía</text>}
        </svg>
      )}
    </div>
  )
}

export function OptionGroup({ options, value, onChange, label, className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map(([v, text]) => {
        const on = value === v
        return (
          <button key={String(v)} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)}
            className={cn('min-h-12 rounded-md border-2 px-4 py-2 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              on ? 'border-primary bg-primary font-bold text-primary-foreground shadow-sm' : 'border-input bg-background hover:border-primary/50 hover:bg-accent')}>
            {text}
          </button>
        )
      })}
    </div>
  )
}

export function Stopwatch({ limite }) {
  const [t0, setT0] = React.useState(null)
  const [acc, setAcc] = React.useState(0)
  const [, tick] = React.useState(0)
  React.useEffect(() => { if (t0 == null) return; const i = setInterval(() => tick((n) => n + 1), 250); return () => clearInterval(i) }, [t0])
  const corriendo = t0 != null
  const s = Math.floor((acc + (corriendo ? Date.now() - t0 : 0)) / 1000)
  const txt = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
  const iniciar = () => setT0(Date.now())
  const parar = () => { setAcc((a) => a + Date.now() - t0); setT0(null) }
  const reiniciar = () => { setT0(null); setAcc(0) }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className={cn('flex min-w-[6ch] items-center gap-2 text-4xl font-bold tabular-nums', corriendo && 'text-primary')} aria-live="off">
        {corriendo && <span className="h-3 w-3 animate-pulse rounded-full bg-destructive" aria-hidden="true" />}{txt}
      </div>
      {corriendo
        ? <Button onClick={parar}><Pause />Parar</Button>
        : <Button variant="outline" onClick={iniciar}><Play />Iniciar</Button>}
      <Button variant="ghost" onClick={reiniciar} disabled={!s && !corriendo}><RotateCcw />Reiniciar</Button>
      {limite && s >= limite && <p role="status" className="basis-full rounded-md border border-warning/40 bg-warning/10 px-3 py-2 font-bold text-warning">Pasaron {Math.round(limite / 60)} minutos: continúe al paso siguiente.</p>}
    </div>
  )
}

export function StickyBar({ children }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t-2 border-primary/25 bg-background px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] sm:mx-0 sm:rounded-t-lg sm:border-x-2 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">{children}</div>
    </div>
  )
}

export function PdfButton({ href, children, variant = 'outline' }) {
  return <Button asChild variant={variant} className="h-auto min-h-12 whitespace-normal py-2.5 text-left"><a href={href} target="_blank" rel="noopener"><FileDown />{children}</a></Button>
}

export function Step({ n, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">{n}</div>
      <div className="flex-1 space-y-3 pb-2"><h3 className="pt-1 text-xl font-bold leading-tight">{title}</h3>{children}</div>
    </div>
  )
}

export function Instr({ children }) {
  if (!children) return null
  return <div className="whitespace-pre-wrap rounded-md border-l-4 border-primary bg-secondary px-4 py-3 text-[17px] leading-relaxed">{children}</div>
}

export function ResultDialog({ result, persona, onClose, go }) {
  const S = useStore()
  if (!result) return null
  const t = T[result.tipo], i = interp(result.tipo, result.puntaje)
  return (
    <Dialog open={!!result} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resultado guardado</DialogTitle>
          <DialogDescription>{t.n} · {persona?.nombre} · {fmt(result.fecha)}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-end gap-4">
          <div className={cn('text-6xl font-bold leading-none', i[0] === 'ok' ? 'text-success' : i[0] === 'gris' ? 'text-warning' : 'text-destructive')}>{nf(result.puntaje, t.dec)}</div>
          <div className="pb-1 text-xl text-muted-foreground">/ {t.max}</div>
          <NivelBadge n={i[0]} className="mb-1.5 text-base" />
        </div>
        <p className="text-lg">{i[1]}</p>
        <Card className="bg-muted/60"><CardContent className="p-4 text-[15px] text-muted-foreground sm:p-4">Una sola prueba no es un diagnóstico. Repítala en 6 meses (próxima: <b className="text-foreground">{fmt(mas6(result.fecha))}</b>) y lleve el informe al médico.{!S.own && <> El resultado quedó guardado solo en este dispositivo: exporte el respaldo y envíeselo a quien administra la app.</>}</CardContent></Card>
        <DialogFooter className="sm:flex-wrap">
          <Button variant="outline" onClick={() => saveFile(`test-memoria-${hoy()}.json`, JSON.stringify(S.exportar(), null, 1), 'Respaldo descargado.')}><Download />Exportar respaldo</Button>
          <Button variant="outline" onClick={() => { onClose(); go('informe') }}>Ver informe</Button>
          <Button onClick={() => { onClose(); go('inicio') }}>Ver el tablero</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border-2 border-dashed p-6 sm:p-8">
      {Icon && <div className="rounded-full bg-secondary p-3 text-primary"><Icon className="h-6 w-6" /></div>}
      <h3 className="text-xl font-bold">{title}</h3>
      {children && <div className="max-w-[60ch] text-muted-foreground">{children}</div>}
      {action}
    </div>
  )
}

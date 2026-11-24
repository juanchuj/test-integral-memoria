import * as React from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NivelBadge, QuienBadge, TrendChart, Empty } from '@/components/parts'
import { T, ORDER, interp, nf, fmt, mas6, hoy, edad } from '@/lib/domain'
import { cn } from '@/lib/utils'
import { UserPlus, CalendarClock, NotebookPen, ArrowRight } from 'lucide-react'

export function NoPersona() {
  const S = useStore()
  return <Empty icon={UserPlus} title="Primero agregue a la persona evaluada" action={<div className="flex flex-wrap gap-2"><Button asChild><a href="#ajustes">Agregar persona</a></Button><Button asChild variant="outline"><a href="#ajustes">Importar un respaldo</a></Button></div>}>En Ajustes puede agregar a la persona (por ejemplo, el Mono, y quienes hagan la prueba de línea base) o importar el archivo JSON que le hayan enviado.</Empty>
}

const tone = (n) => (n === 'ok' ? 'text-success' : n === 'gris' ? 'text-warning' : 'text-destructive')

export default function Inicio({ persona, res, notas }) {
  if (!persona) return <NoPersona />
  const ed = edad(persona)
  const ult = [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 4)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-bold leading-[1.05] sm:text-[40px]">Tablero de {persona.nombre}</h1>
        <p className="mt-2 max-w-[70ch] text-lg text-muted-foreground">{ed ? `${ed} años · ` : ''}Lo importante es la tendencia: repita las pruebas cada 6 meses. Las bandas de color marcan los rangos de cada prueba.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {ORDER.map((k) => {
          const t = T[k], r = res.filter((x) => x.tipo === k), u = r[r.length - 1], i = u && interp(k, u.puntaje)
          return (
            <Card key={k} className="flex flex-col">
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-2">
                <div className="space-y-1.5"><CardTitle className="text-2xl">{t.n}</CardTitle><QuienBadge quien={t.quien} /></div>
                {u ? (
                  <div className="w-full sm:w-auto sm:text-right">
                    <div className={cn('text-5xl font-bold leading-none', tone(i[0]))}>{nf(u.puntaje, t.dec)}<span className="text-lg font-normal text-muted-foreground"> / {t.max}</span></div>
                    <div className="mt-2 flex items-center gap-2 sm:justify-end"><NivelBadge n={i[0]} /><span className="text-sm text-muted-foreground">{fmt(u.fecha)}</span></div>
                  </div>
                ) : <Button asChild variant="outline"><a href={'#' + k}>Hacer la primera<ArrowRight /></a></Button>}
              </CardHeader>
              <CardContent className="flex-1 pb-3"><TrendChart pts={r} t={t} /></CardContent>
              {u && <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[15px] sm:px-6"><span className="text-muted-foreground">{r.length} {r.length === 1 ? 'resultado' : 'resultados'}</span><a href={'#' + k} className="font-bold text-primary hover:underline">Repetir prueba</a></div>}
            </Card>
          )
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />Próximos chequeos</CardTitle><CardDescription>Seis meses después del último resultado de cada prueba.</CardDescription></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {ORDER.map((k) => {
                const r = res.filter((x) => x.tipo === k), u = r[r.length - 1], f = u ? mas6(u.fecha) : null, venc = f && f <= hoy()
                return <li key={k} className="flex items-center justify-between gap-3 py-3"><span className="font-bold">{T[k].n}</span><span className={cn('whitespace-nowrap tabular-nums', venc ? 'font-bold text-destructive' : !u ? 'text-muted-foreground' : '')}>{u ? (venc ? 'Ya toca · ' : '') + fmt(f) : 'Pendiente'}</span></li>
              })}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><NotebookPen className="h-5 w-5 text-primary" />Últimas observaciones</CardTitle><CardDescription>Del diario de la familia.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {ult.length ? <ul className="divide-y">{ult.map((x) => <li key={x.id} className="py-3"><div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-bold text-primary">{x.area}</span><span className="text-muted-foreground">{fmt(x.fecha)}</span></div><p className="mt-1">{x.texto}</p></li>)}</ul> : <p className="text-muted-foreground">Aún no hay observaciones.</p>}
            <Button asChild variant="outline"><a href="#diario">Abrir el diario</a></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

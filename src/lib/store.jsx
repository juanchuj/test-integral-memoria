import * as React from 'react'
import { toast } from 'sonner'
import { probarPin, abrirContenido } from './crypto'

const LK = 'test-integral-memoria-datos'
const SK = 'test-integral-memoria-sesion'
const COLS = ['personas', 'resultados', 'notas']
const Ctx = React.createContext(null)
const store = {
  get: (k, s = localStorage) => { try { return s.getItem(k) } catch (e) { return null } },
  set: (k, v, s = localStorage) => { try { s.setItem(k, v); return true } catch (e) { return false } },
  del: (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k) } catch (e) {} },
}

function loadLocal() {
  let L = { personas: {}, resultados: {}, notas: {} }
  try { const r = store.get(LK); if (r) L = Object.assign(L, JSON.parse(r)) } catch (e) {}
  return L
}
const toArrays = (L) => Object.fromEntries(COLS.map((c) => [c, Object.entries(L[c] || {}).map(([id, v]) => ({ ...v, id }))]))

export function StoreProvider({ children }) {
  const local = React.useRef(loadLocal())
  const [data, setData] = React.useState(() => toArrays(local.current))
  const [bundle, setBundle] = React.useState(null)
  const [estado, setEstado] = React.useState('cargando') // cargando | bloqueado | abierto | error
  const [sesion, setSesion] = React.useState(null) // { rol, textos, pdf }

  const persist = () => {
    const ok = store.set(LK, JSON.stringify(local.current))
    if (!ok) toast.error('No se pudo guardar en este dispositivo.', { description: 'El almacenamiento del navegador está lleno o bloqueado.' })
    setData(toArrays(local.current))
    return ok
  }

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('./contenido.enc.json', { cache: 'no-cache' })
        if (!r.ok) throw new Error('HTTP ' + r.status)
        const b = await r.json()
        if (!alive) return
        setBundle(b)
        const guardada = store.get(SK) || store.get(SK, sessionStorage)
        if (guardada) {
          try {
            const { rol, llave } = JSON.parse(guardada)
            const c = await abrirContenido(b, llave)
            if (alive) { setSesion({ rol, ...c }); setEstado('abierto') }
            return
          } catch (e) { store.del(SK) }
        }
        if (alive) setEstado('bloqueado')
      } catch (e) { if (alive) setEstado('error') }
    })()
    return () => { alive = false }
  }, [])

  const unlock = React.useCallback(async (pin, recordar) => {
    if (!bundle) return false
    const r = await probarPin(bundle, pin)
    if (!r) return false
    const c = await abrirContenido(bundle, r.llave)
    store.del(SK)
    store.set(SK, JSON.stringify(r), recordar ? localStorage : sessionStorage)
    setSesion({ rol: r.rol, ...c }); setEstado('abierto')
    return r.rol
  }, [bundle])

  const lock = React.useCallback(() => {
    store.del(SK)
    if (sesion?.pdf) Object.values(sesion.pdf).forEach((u) => URL.revokeObjectURL(u))
    setSesion(null); setEstado('bloqueado')
  }, [sesion])

  const put = React.useCallback(async (c, id, doc) => {
    const L = local.current; L[c] = L[c] || {}
    const prev = L[c][id]; L[c][id] = doc
    if (!persist()) { if (prev === undefined) delete L[c][id]; else L[c][id] = prev; throw new Error('storage') }
  }, [])
  const del = React.useCallback(async (c, id) => { const L = local.current; if (L[c]) delete L[c][id]; persist() }, [])

  const exportar = React.useCallback(() => ({
    app: 'test-integral-memoria', formato: 1, exportado: new Date().toISOString(),
    personas: toArrays(local.current).personas, resultados: toArrays(local.current).resultados, notas: toArrays(local.current).notas,
  }), [])

  /** Une un respaldo con los datos actuales (por id). Devuelve conteos de nuevos y actualizados. */
  const importar = React.useCallback((j) => {
    if (!j || typeof j !== 'object' || !COLS.some((c) => Array.isArray(j[c]))) throw new Error('formato')
    const L = local.current, n = { nuevos: 0, actualizados: 0 }
    for (const c of COLS) for (const r of Array.isArray(j[c]) ? j[c] : []) {
      if (!r || typeof r !== 'object' || !r.id) continue
      const { id, ...v } = r; L[c] = L[c] || {}
      if (L[c][id]) n.actualizados++; else n.nuevos++
      L[c][String(id)] = v
    }
    if (!persist()) throw new Error('storage')
    return n
  }, [])

  const value = React.useMemo(() => ({
    ...data, estado, rol: sesion?.rol || null, own: sesion?.rol === 'admin', cfg: sesion?.textos || {}, pdf: sesion?.pdf || {},
    unlock, lock, put, del, exportar, importar,
  }), [data, estado, sesion, unlock, lock, put, del, exportar, importar])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useStore = () => React.useContext(Ctx)

export function saveFile(filename, text, okMsg) {
  try {
    const ext = filename.split('.').pop()
    const type = ext === 'html' ? 'text/html' : ext === 'json' ? 'application/json' : 'text/markdown'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })); a.download = filename
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    toast.success(okMsg)
  } catch (e) { toast.error('No se pudo descargar.', { description: 'Use el botón Copiar.' }) }
}
export async function copyText(t, msg = 'Copiado al portapapeles.') {
  try { await navigator.clipboard.writeText(t); toast.success(msg) } catch (e) { toast.error('No se pudo copiar.') }
}

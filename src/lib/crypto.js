const dec = new TextDecoder(), enc = new TextEncoder()
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
export const toB64 = (u8) => { let s = ''; const c = 0x8000; for (let i = 0; i < u8.length; i += c) s += String.fromCharCode.apply(null, u8.subarray(i, i + c)); return btoa(s) }

async function pinKey(pin, salt, iter) {
  const base = await crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt'])
}
const open = async (key, { iv, ct }) => new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct)))

/** Devuelve { rol, llave } si el PIN abre alguna de las llaves; null si no. */
export async function probarPin(bundle, pin) {
  for (const l of bundle.llaves) {
    try {
      const raw = await open(await pinKey(pin, unb64(l.salt), bundle.kdf.iter), l)
      return { rol: l.rol, llave: toB64(raw) }
    } catch (e) { /* PIN no corresponde a esta llave */ }
  }
  return null
}

/** Descifra el contenido con la llave (base64) ya obtenida. */
export async function abrirContenido(bundle, llaveB64) {
  const key = await crypto.subtle.importKey('raw', unb64(llaveB64), 'AES-GCM', false, ['decrypt'])
  const data = JSON.parse(dec.decode(await open(key, bundle.datos)))
  const pdf = {}
  for (const [k, v] of Object.entries(data.pdfs || {})) pdf[k] = URL.createObjectURL(new Blob([unb64(v)], { type: 'application/pdf' }))
  return { textos: data.textos || {}, pdf }
}

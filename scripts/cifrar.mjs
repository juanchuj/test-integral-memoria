// Cifra los textos oficiales y los PDF con los PIN de administrador y de usuario.
// Uso: node scripts/cifrar.mjs --admin <PIN_ADMIN> --usuario <PIN_USUARIO>
// Lee contenido/textos.json y contenido/pdfs/*.pdf (no se suben a GitHub)
// y escribe public/contenido.enc.json (sí se sube: está cifrado).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { webcrypto as crypto } from 'node:crypto'

const ITER = 310000
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : process.env['PIN_' + n.toUpperCase()] }
const pins = { admin: arg('admin'), usuario: arg('usuario') }
for (const [k, v] of Object.entries(pins)) if (!v || String(v).length < 4) { console.error(`Falta el PIN de ${k} (mínimo 4 caracteres).`); process.exit(1) }
if (pins.admin === pins.usuario) { console.error('Los dos PIN deben ser distintos.'); process.exit(1) }

const b64 = (u8) => Buffer.from(u8).toString('base64')
const enc = new TextEncoder()
async function pinKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt'])
}
async function seal(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes))
  return { iv: b64(iv), ct: b64(ct) }
}

const textos = JSON.parse(readFileSync('contenido/textos.json', 'utf8'))
const pdfs = {}
for (const f of readdirSync('contenido/pdfs').filter((f) => f.endsWith('.pdf'))) pdfs[f.replace(/\.pdf$/, '')] = readFileSync('contenido/pdfs/' + f).toString('base64')

const raw = crypto.getRandomValues(new Uint8Array(32))
const contentKey = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt'])
const llaves = []
for (const rol of ['admin', 'usuario']) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  llaves.push({ rol, salt: b64(salt), ...(await seal(await pinKey(pins[rol], salt), raw)) })
}
const datos = await seal(contentKey, enc.encode(JSON.stringify({ textos, pdfs })))
writeFileSync('public/contenido.enc.json', JSON.stringify({ v: 1, kdf: { alg: 'PBKDF2-SHA256', iter: ITER }, llaves, datos }))
console.log(`Listo: public/contenido.enc.json (${Object.keys(pdfs).length} PDF, ${Object.keys(textos).length} textos).`)

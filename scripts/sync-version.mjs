#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function main() {
  // Read version from package.json (single source of truth)
  const pkgPath = path.join(root, 'package.json')
  const pkgRaw = await readFile(pkgPath, 'utf8')
  const pkg = JSON.parse(pkgRaw)
  const version = pkg.version
  if (!version || typeof version !== 'string') {
    throw new Error('Could not determine version from package.json')
  }

  // Update src-tauri/tauri.conf.json
  const tauriConfPath = path.join(root, 'src-tauri', 'tauri.conf.json')
  try {
    const confRaw = await readFile(tauriConfPath, 'utf8')
    const conf = JSON.parse(confRaw)
    if (!conf.package) conf.package = {}
    conf.package.version = version
    await writeFile(tauriConfPath, JSON.stringify(conf, null, 2) + '\n', 'utf8')
  } catch (e) {
    // If file missing or invalid, surface the error to fail the version step
    throw new Error(`Failed to update tauri.conf.json: ${String(e)}`)
  }

  // Update src-tauri/Cargo.toml (simple regex replace on version field)
  const cargoPath = path.join(root, 'src-tauri', 'Cargo.toml')
  try {
    const cargoRaw = await readFile(cargoPath, 'utf8')
    const updated = cargoRaw.replace(/(^version\s*=\s*")[^"]+("\s*$)/m, `$1${version}$2`)
    await writeFile(cargoPath, updated, 'utf8')
  } catch (e) {
    throw new Error(`Failed to update Cargo.toml: ${String(e)}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

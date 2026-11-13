import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [major, minor] = process.versions.node.split('.').map(Number)
if (!(major > 22 || (major === 22 && minor >= 12) || (major === 20 && minor >= 19))) {
  console.error('Node.js 20.19+ or 22.12+ is required. The installed Node.js is ' + process.versions.node)
  process.exit(1)
}
const vite = resolve(root, 'node_modules/vite/bin/vite.js')
if (!existsSync(vite)) {
  console.error('Dependencies are missing. Run npm ci with a supported Node.js version first.')
  process.exit(1)
}
if (!existsSync(resolve(root, 'dist/index.html')) || process.argv.includes('--build')) {
  const build = spawnSync(process.execPath, [vite, 'build'], { cwd: root, stdio: 'inherit', windowsHide: true })
  if (build.status !== 0) process.exit(build.status || 1)
}
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1'
const protocol = process.env.ANALYZ_HTTPS_CERT && process.env.ANALYZ_HTTPS_KEY ? 'https' : 'http'
const url = `${protocol}://127.0.0.1:4173/`
console.log(`Analyz: ${url}`)
console.log('Keep this window open. Press Ctrl+C to stop.')
const server = spawn(process.execPath, [vite, 'preview', '--host', host, '--port', '4173', '--strictPort'], { cwd: root, stdio: 'inherit', windowsHide: true })
server.on('exit', code => process.exit(code || 0))
process.on('SIGINT', () => { server.kill(); process.exit(0) })
if (process.platform === 'win32' && !process.argv.includes('--no-open')) {
  const opener = spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' })
  opener.unref()
}

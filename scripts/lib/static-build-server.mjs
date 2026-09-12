import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const mimeTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export async function startStaticBuildServer({ directory = 'dist', prefix = '/' } = {}) {
  const root = path.resolve(directory)
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
      if (!pathname.startsWith(normalizedPrefix)) { response.writeHead(404).end('Not found'); return }
      const relative = pathname.slice(normalizedPrefix.length) || 'index.html'
      const target = path.resolve(root, relative)
      if (!target.startsWith(`${root}${path.sep}`) || !(await stat(target)).isFile()) { response.writeHead(404).end('Not found'); return }
      response.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': mimeTypes[path.extname(target)] ?? 'application/octet-stream' })
      response.end(await readFile(target))
    } catch {
      response.writeHead(404).end('Not found')
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Unable to resolve static server port')
  return {
    url: `http://127.0.0.1:${address.port}${normalizedPrefix}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  }
}

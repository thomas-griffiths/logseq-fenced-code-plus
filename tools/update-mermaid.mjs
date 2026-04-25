import { mkdir, writeFile } from 'node:fs/promises'

const version = process.argv[2] || '11.14.0'
const base = `https://cdn.jsdelivr.net/npm/mermaid@${version}/dist`

const files = [
  'mermaid.min.js',
  'mermaid.min.js.map'
]

await mkdir('./vendors', { recursive: true })

for (const file of files) {
  const url = `${base}/${file}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }

  const content = await response.text()
  await writeFile(`./vendors/${file}`, content, 'utf8')
  console.log(`Updated vendors/${file} from ${url}`)
}

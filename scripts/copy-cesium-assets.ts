import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const PLAYGROUND_CESIUM_DIR = path.resolve(ROOT_DIR, 'playground', 'public', 'cesium')
const ASSET_DIRS = ['Workers', 'Assets', 'Widgets', 'ThirdParty'] as const

export async function copyCesiumAssets() {
  const cesiumBuildDir = await resolveCesiumBuildDir()
  await fs.mkdir(PLAYGROUND_CESIUM_DIR, { recursive: true })

  for (const dir of ASSET_DIRS) {
    const src = path.resolve(cesiumBuildDir, dir)
    const dest = path.resolve(PLAYGROUND_CESIUM_DIR, dir)

    await fs.rm(dest, { recursive: true, force: true })
    await fs.cp(src, dest, { recursive: true, force: true })
  }

  return {
    source: cesiumBuildDir,
    target: PLAYGROUND_CESIUM_DIR,
    copied: [...ASSET_DIRS],
  }
}

async function resolveCesiumBuildDir() {
  const candidates = [
    path.resolve(ROOT_DIR, 'node_modules', 'cesium', 'Build', 'Cesium'),
    path.resolve(ROOT_DIR, 'playground', 'node_modules', 'cesium', 'Build', 'Cesium'),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    'Cesium build assets not found. Please install dependencies first (for example: pnpm --filter playground install).',
  )
}

async function main() {
  try {
    const result = await copyCesiumAssets()
    console.log('✅ Cesium static assets copied successfully.')
    console.log(`   source: ${result.source}`)
    console.log(`   target: ${result.target}`)
    console.log(`   dirs:   ${result.copied.join(', ')}`)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(`❌ Failed to copy Cesium static assets: ${message}`)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main()
}

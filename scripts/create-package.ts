import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { copyCesiumAssets } from './copy-cesium-assets'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages')
const TEMPLATES_DIR = path.resolve(__dirname, 'templates')

async function createPackage() {
  const { values } = parseArgs({
    options: {
      name: { type: 'string', short: 'n' },
      template: { type: 'string', short: 't' },
      desc: { type: 'string', short: 'd' },
    },
  })

  const packageName = values.name
  const templateName = values.template || 'utils'
  const packageDesc = values.desc || `A ${templateName} package.`

  if (!packageName) {
    console.error('Error: Package name is required. Use --name or -n.')
    process.exit(1)
  }

  const rootPkg = JSON.parse(await fs.readFile(path.resolve(ROOT_DIR, 'package.json'), 'utf-8'))
  const rootName = rootPkg.name
  const prefix = `${rootName}-`

  const fullPackageName =
    packageName.startsWith('@') || packageName.includes('/')
      ? packageName
      : `${prefix}${packageName}`

  const targetDir = path.resolve(PACKAGES_DIR, packageName)

  try {
    await fs.access(targetDir)
    console.error(`Error: Directory ${targetDir} already exists.`)
    process.exit(1)
  } catch {
    // Directory doesn't exist, which is expected.
  }

  const baseTemplateDir = path.resolve(TEMPLATES_DIR, 'base')
  const scenarioTemplateDir = path.resolve(TEMPLATES_DIR, templateName)

  try {
    await fs.access(scenarioTemplateDir)
  } catch {
    console.error(`Error: Template '${templateName}' not found in ${TEMPLATES_DIR}.`)
    process.exit(1)
  }

  console.log(`Creating package '${packageName}' using template '${templateName}'...`)

  await fs.mkdir(targetDir, { recursive: true })

  const replacements = {
    __PACKAGE_NAME__: fullPackageName,
    __PACKAGE_DIR__: packageName,
    __PACKAGE_DESC__: packageDesc,
    '{{PACKAGE_NAME}}': fullPackageName,
    '{{PACKAGE_DIR}}': packageName,
    '{{PACKAGE_DESC}}': packageDesc,
  }

  await copyDirAndReplace(baseTemplateDir, targetDir, replacements)
  await copyDirAndReplace(scenarioTemplateDir, targetDir, replacements)

  console.log(`\n✅ Package '${packageName}' created successfully!`)
  console.log('\nNext steps:')
  console.log(`  1. cd packages/${packageName}`)
  console.log('  2. pnpm install')
  console.log('  3. pnpm build')

  if (templateName === 'cesium') {
    console.log('\n🚀 Automating Cesium Playground Setup...')
    await setupCesiumPlayground(fullPackageName)
  }

  console.log('\n  *. Connect the package to your playground to test it.\n')
}

async function setupCesiumPlayground(fullPackageName: string) {
  const playgroundDir = path.resolve(ROOT_DIR, 'playground')
  const pkgJsonPath = path.resolve(playgroundDir, 'package.json')
  const mainTsPath = path.resolve(playgroundDir, 'src/main.ts')

  try {
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'))
    pkgJson.dependencies = pkgJson.dependencies || {}

    if (!pkgJson.dependencies.cesium) {
      pkgJson.dependencies.cesium = '^1.140.0'
      await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n')
      console.log('  ✅ Updated playground/package.json')
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('  ⚠️ Failed to update playground/package.json:', message)
  }

  try {
    const next = `;(window as any).CESIUM_BASE_URL = '/cesium'

import 'cesium/Build/Cesium/Widgets/widgets.css'
import { createViewer } from '${fullPackageName}'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = \`
  <h1>Cesium Playground</h1>
  <div id="cesiumContainer" style="width: 100%; height: 500px;"></div>
\`

// 2. 使用 createViewer 初始化
// 传入容器的 ID "cesiumContainer"
const viewer = createViewer('cesiumContainer')
`
    await fs.writeFile(mainTsPath, next, 'utf-8')
    console.log('  ✅ Updated playground/src/main.ts')
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('  ⚠️ Failed to update playground/src/main.ts:', message)
  }

  try {
    const result = await copyCesiumAssets()
    console.log('  ✅ Copied Cesium static assets:')
    console.log(`     from: ${result.source}`)
    console.log(`     to:   ${result.target}`)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn('  ⚠️ Failed to copy Cesium static assets:', message)
    console.warn('     You can run: pnpm copy:cesium')
  }
}

async function copyDirAndReplace(
  srcDir: string,
  destDir: string,
  replacements: Record<string, string>,
) {
  const entries = await fs.readdir(srcDir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true })
      await copyDirAndReplace(srcPath, destPath, replacements)
    } else {
      let content = await fs.readFile(srcPath, 'utf-8')

      for (const [key, value] of Object.entries(replacements)) {
        content = content.replaceAll(key, value)
      }

      if (entry.name === 'package.json') {
        try {
          const existingContent = await fs.readFile(destPath, 'utf-8')
          const existingJson = JSON.parse(existingContent)
          const newJson = JSON.parse(content)

          const mergedJson = { ...existingJson, ...newJson }
          for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'scripts']) {
            if (existingJson[key] || newJson[key]) {
              mergedJson[key] = { ...existingJson[key], ...newJson[key] }
            }
          }
          content = JSON.stringify(mergedJson, null, 2) + '\n'
        } catch {
          // File doesn't exist or isn't valid JSON.
        }
      }

      await fs.writeFile(destPath, content, 'utf-8')
    }
  }
}

createPackage().catch((err) => {
  console.error('Failed to create package:', err)
  process.exit(1)
})

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

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

  // Get project prefix from root package.json
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
    // Directory doesn't exist, which is expected
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

  // 1. Create package directory
  await fs.mkdir(targetDir, { recursive: true })

  // 2. Copy base template
  await copyDirAndReplace(baseTemplateDir, targetDir, {
    __PACKAGE_NAME__: fullPackageName,
    __PACKAGE_DIR__: packageName,
    __PACKAGE_DESC__: packageDesc,
  })

  // 3. Copy scenario template (overwrites base and merges package.json)
  await copyDirAndReplace(scenarioTemplateDir, targetDir, {
    __PACKAGE_NAME__: fullPackageName,
    __PACKAGE_DIR__: packageName,
    __PACKAGE_DESC__: packageDesc,
  })

  console.log(`\n✅ Package '${packageName}' created successfully!`)
  console.log(`\nNext steps:`)
  console.log(`  1. cd packages/${packageName}`)
  console.log(`  2. pnpm install`)
  console.log(`  3. pnpm build`)
  console.log(`  4. Connect the package to your playground to test it.\n`)
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

      // Replace placeholders
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replaceAll(key, value)
      }

      // Merge package.json if it exists
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
          // File doesn't exist or isn't valid JSON, use new content
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

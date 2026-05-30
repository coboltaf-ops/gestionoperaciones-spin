import { rename, existsSync, mkdirSync } from 'fs'
import { promisify } from 'util'
import { join } from 'path'

const renameFile = promisify(rename)

export async function POST(request: Request) {
  try {
    const { fileName, fromApp, toApp } = await request.json()

    if (!fileName || !fromApp || !toApp) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const docsPath = join(process.cwd(), 'public', 'library', 'documentacion')
    const libPath = join(process.cwd(), 'library', 'documentacion')

    const fromPathPublic = join(docsPath, fromApp, fileName)
    const toPathPublic = join(docsPath, toApp, fileName)
    const fromPathLib = join(libPath, fromApp, fileName)
    const toPathLib = join(libPath, toApp, fileName)

    // Verify source file exists
    if (!existsSync(fromPathPublic)) {
      return Response.json(
        { error: 'Source file not found' },
        { status: 404 }
      )
    }

    // Create destination directory if it doesn't exist
    if (!existsSync(join(docsPath, toApp))) {
      mkdirSync(join(docsPath, toApp), { recursive: true })
    }
    if (!existsSync(join(libPath, toApp))) {
      mkdirSync(join(libPath, toApp), { recursive: true })
    }

    // Move files
    await renameFile(fromPathPublic, toPathPublic)
    await renameFile(fromPathLib, toPathLib)

    return Response.json({
      success: true,
      message: `${fileName} movido de ${fromApp} a ${toApp}`,
    })
  } catch (error) {
    console.error('Error moving file:', error)
    return Response.json(
      { error: 'Error moving file' },
      { status: 500 }
    )
  }
}

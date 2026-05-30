import { unlink, existsSync } from 'fs'
import { promisify } from 'util'
import { join } from 'path'

const deleteFile = promisify(unlink)

export async function POST(request: Request) {
  try {
    const { fileName, app } = await request.json()

    if (!fileName || !app) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const docsPath = join(process.cwd(), 'public', 'library', 'documentacion')
    const libPath = join(process.cwd(), 'library', 'documentacion')

    const filePathPublic = join(docsPath, app, fileName)
    const filePathLib = join(libPath, app, fileName)

    // Verify files exist
    if (!existsSync(filePathPublic) && !existsSync(filePathLib)) {
      return Response.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete files
    if (existsSync(filePathPublic)) {
      await deleteFile(filePathPublic)
    }
    if (existsSync(filePathLib)) {
      await deleteFile(filePathLib)
    }

    return Response.json({
      success: true,
      message: `${fileName} eliminado correctamente`,
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return Response.json(
      { error: 'Error deleting file' },
      { status: 500 }
    )
  }
}

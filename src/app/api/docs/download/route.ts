import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Encode a filename for use in Content-Disposition per RFC 5987.
 * This ensures browsers on all platforms (Safari/Chrome/Firefox on Mac)
 * download the file with the correct original filename, including
 * spaces and special characters.
 */
function encodeFilenameRFC5987(filename: string): string {
  return encodeURIComponent(filename)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const app = searchParams.get('app')
    const file = searchParams.get('file')

    if (!app || !file) {
      return Response.json({ error: 'Missing app or file' }, { status: 400 })
    }

    // Security: prevent directory traversal
    if (file.includes('..') || file.includes('/')) {
      return Response.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', 'library', 'documentacion', app, file)
    const buffer = readFileSync(filePath)

    // RFC 5987 encoding ensures the browser uses the correct filename when
    // downloading, even with spaces and special characters.
    const encodedFilename = encodeFilenameRFC5987(file)
    const contentDisposition = `attachment; filename="${file}"; filename*=UTF-8''${encodedFilename}`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return Response.json({ error: 'Error downloading document' }, { status: 500 })
  }
}

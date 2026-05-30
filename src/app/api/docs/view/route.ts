import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Encode a filename for use in Content-Disposition per RFC 5987.
 * This ensures browsers on all platforms (Safari/Chrome/Firefox on Mac)
 * correctly display the filename when saving a PDF.
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

    if (file.includes('..') || file.includes('/')) {
      return Response.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', 'library', 'documentacion', app, file)
    const buffer = readFileSync(filePath)

    // RFC 5987 encoding ensures browsers preserve the exact filename with
    // spaces and special characters when the user saves (Cmd+S) the PDF.
    const encodedFilename = encodeFilenameRFC5987(file)

    // CRITICAL FIX FOR SAFARI BUG:
    // Safari's native PDF viewer caches titles from previously viewed PDFs.
    // When user presses Cmd+S, it suggests the PREVIOUS PDF's title instead of
    // the current one. This happens because Safari's WebKit PDF viewer has a bug
    // where it retains title metadata across page navigations.
    //
    // Solution: Use 'inline' but with explicit Content-Disposition header that
    // Safari MUST respect. Also add Cache-Control headers to prevent any caching
    // of PDF metadata by the viewer.
    const contentDisposition = `inline; filename="${file}"; filename*=UTF-8''${encodedFilename}`

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': buffer.length.toString(),
        // Prevent Safari PDF viewer from caching metadata
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Tell Safari not to cache this response
        'Last-Modified': new Date().toUTCString(),
        // Force content validation on each request
        'ETag': `"${buffer.length}-${Date.now()}"`,
      },
    })
  } catch (error) {
    console.error('View error:', error)
    return Response.json({ error: 'Error loading document' }, { status: 500 })
  }
}

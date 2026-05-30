import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Raw PDF endpoint - serves PDF binary without any HTML wrapper
 * Used by the PDF.js viewer to fetch PDF content with proper download headers
 */
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

    // Content-Disposition: inline allows viewing in pdf.js, but with correct filename
    // This prevents Safari from caching titles from previous PDFs
    const encodedFilename = encodeURIComponent(file)
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file}"; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': buffer.length.toString(),
        // Prevent any caching of this response
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Force revalidation on each request
        'Last-Modified': new Date().toUTCString(),
      },
    })
  } catch (error) {
    console.error('Raw PDF error:', error)
    return Response.json({ error: 'Error loading document' }, { status: 500 })
  }
}

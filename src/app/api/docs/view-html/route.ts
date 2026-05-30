import { readFileSync } from 'fs'
import { join } from 'path'

function encodeFilenameRFC5987(filename: string): string {
  return encodeURIComponent(filename)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

/**
 * HTML wrapper endpoint that serves PDF.js viewer instead of Safari's native viewer
 * This prevents Safari from using cached PDF metadata (title) from previously viewed PDFs
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

    // Verify file exists
    const filePath = join(process.cwd(), 'public', 'library', 'documentacion', app, file)
    try {
      readFileSync(filePath)
    } catch {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    const encodedApp = encodeURIComponent(app)
    const encodedFile = encodeURIComponent(file)
    const pdfUrl = `/api/docs/raw?app=${encodedApp}&file=${encodedFile}`

    // Return HTML with pdf.js viewer that properly handles filename
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #1a1a1a; }
    #viewer-container { width: 100%; height: 100%; display: flex; flex-direction: column; }
    #toolbar {
      background: #2a2a2a;
      border-bottom: 1px solid #444;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      color: #fff;
    }
    #toolbar button {
      background: #444;
      color: #fff;
      border: 1px solid #666;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    #toolbar button:hover { background: #555; }
    #toolbar button:active { transform: scale(0.98); }
    #toolbar .filename {
      flex: 1;
      font-size: 14px;
      color: #aaa;
      word-break: break-all;
      margin: 0 8px;
    }
    #pdf-viewer {
      flex: 1;
      overflow: auto;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pdf-page {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      margin: 16px;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
<div id="viewer-container">
  <div id="toolbar">
    <button id="download-btn">⬇️ Descargar</button>
    <div class="filename">${file}</div>
  </div>
  <div id="pdf-viewer"></div>
</div>

<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdfUrl = '${pdfUrl}';
const filename = '${file}';

document.getElementById('download-btn').addEventListener('click', async () => {
  const response = await fetch(pdfUrl);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
});

// Load and render PDF
let pdfDoc = null;

async function renderPDF() {
  try {
    pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
    const viewer = document.getElementById('pdf-viewer');
    viewer.innerHTML = '';

    for (let pageNum = 1; pageNum <= Math.min(pdfDoc.numPages, 1); pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;

      viewer.appendChild(canvas);
    }

    if (pdfDoc.numPages > 1) {
      const info = document.createElement('div');
      info.style.cssText = 'color: #aaa; font-size: 12px; text-align: center; padding: 16px;';
      info.textContent = \`Mostrando página 1 de \${pdfDoc.numPages} (descarga para ver todas)\`;
      viewer.appendChild(info);
    }
  } catch (error) {
    console.error('PDF Error:', error);
    document.getElementById('pdf-viewer').innerHTML = '<div style="color: #f00; padding: 20px;">Error loading PDF</div>';
  }
}

renderPDF();
</script>
</body>
</html>
    `.trim()

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('View HTML error:', error)
    return Response.json({ error: 'Error loading document' }, { status: 500 })
  }
}

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

// ─── Auth constants ───────────────────────────────────────────────────────────
const DOC_PASSWORD = 'oEq7zYBodrV%U&kz';
const SESSION_KEY = 'doc-biblioteca-auth';

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === DOC_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setValue('');
      setTimeout(() => setShaking(false), 500);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
        style={{ background: '#0f172a' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-center"
          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #db2777)' }}
        >
          <span className="text-4xl">📚</span>
          <h1 className="text-white font-bold text-lg mt-2">Biblioteca de Documentación</h1>
          <p className="text-blue-100 text-xs mt-1">Centro de documentación centralizado</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8 flex flex-col items-center">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-white mb-1">Acceso Protegido</h2>
          <p className="text-slate-400 text-sm mb-6 text-center">
            Ingresa la contraseña para acceder a esta sección
          </p>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <input
              ref={inputRef}
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Contraseña"
              autoComplete="off"
              className={`w-full px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 border-2 outline-none transition-all
                ${error ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'}
                ${shaking ? '[animation:shake_0.4s_ease-in-out]' : ''}`}
            />
            {error && (
              <p className="text-red-400 text-xs text-center -mt-1">
                Contraseña incorrecta. Intenta de nuevo.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white transition-all
                bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                active:scale-95 shadow-lg"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Biblioteca content (same as before, just extracted) ───────────────────

const APPS = [
  { id: 'SaaS Factory', name: 'SaaS Factory V4', icon: '🏗️' },
  { id: 'crmspin', name: 'CRM Spin', icon: '🎯' },
  { id: 'gestioninventario', name: 'Gestión Inventario', icon: '📦' },
  { id: 'crmnovaseguridad', name: 'CRM Nova Seguridad', icon: '🔒' },
  { id: 'crmflores', name: 'CRM Flores', icon: '🌹' },
  { id: 'gestionoperaciones-borinquen', name: 'Gestión Operaciones Borinquen', icon: '🏭' },
  { id: 'gestionoperaciones-spin', name: 'Gestión Operaciones SPIN ✨', icon: '⚙️' },
  { id: 'crmpalomaresconsultor', name: 'CRM Palomares Consultor', icon: '💼' },
  { id: 'crmcomercial', name: 'CRM Comercial', icon: '💰' },
  { id: 'calzadoropa', name: 'Calzado & Ropa', icon: '👟' },
];

interface PDFFile {
  name: string;
  path: string;
  app: string;
}

function BibliotecaContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [viewingPDF, setViewingPDF] = useState<PDFFile | null>(null);
  const [allPDFs, setAllPDFs] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingPDF, setMovingPDF] = useState<PDFFile | null>(null);
  const [movingTo, setMovingTo] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [deletingPDF, setDeletingPDF] = useState<PDFFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/docs/list', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await response.json();
      const flattened = data.flatMap((app: any) =>
        app.pdfs.map((pdf: any) => ({
          name: pdf.name,
          path: pdf.path,
          app: app.app,
        }))
      );
      setAllPDFs(flattened);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  const filteredPDFs = useMemo(() => {
    return allPDFs.filter((pdf) => {
      const matchesSearch = pdf.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesApp = !selectedApp || pdf.app === selectedApp;
      return matchesSearch && matchesApp;
    });
  }, [searchTerm, selectedApp, allPDFs]);

  const handleMovePDF = async () => {
    if (!movingPDF || !movingTo) return;

    setMoving(true);
    try {
      const response = await fetch('/api/docs/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: movingPDF.name,
          fromApp: movingPDF.app,
          toApp: movingTo,
        }),
      });

      if (response.ok) {
        setAllPDFs(allPDFs.map((pdf) =>
          pdf.name === movingPDF.name && pdf.app === movingPDF.app
            ? { ...pdf, app: movingTo }
            : pdf
        ));
        setMovingPDF(null);
        setMovingTo(null);
        alert('✅ PDF movido correctamente');
      } else {
        alert('❌ Error al mover el PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al mover el PDF');
    } finally {
      setMoving(false);
    }
  };

  const handleDeletePDF = async () => {
    if (!deletingPDF) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/docs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: deletingPDF.name,
          app: deletingPDF.app,
        }),
      });

      if (response.ok) {
        setAllPDFs(allPDFs.filter(
          (pdf) => !(pdf.name === deletingPDF.name && pdf.app === deletingPDF.app)
        ));
        setDeletingPDF(null);
        alert('✅ PDF eliminado correctamente');
      } else {
        alert('❌ Error al eliminar el PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar el PDF');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div suppressHydrationWarning className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">📚 Mi Biblioteca de Documentación</h1>
            <p className="text-blue-100">Todos tus documentos organizados en un solo lugar</p>
            <p className="text-blue-100 mt-1 text-sm">Total: {allPDFs.length} documentos</p>
          </div>
          <button
            onClick={() => fetchPDFs()}
            disabled={loading}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {deletingPDF && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Eliminar PDF</h2>
            <p className="text-slate-600 mb-4">
              ¿Estás seguro de que quieres eliminar?
            </p>
            <p className="text-slate-900 font-semibold mb-4 p-3 bg-slate-100 rounded">
              {deletingPDF.name}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingPDF(null)}
                className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePDF}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
              >
                {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {movingPDF && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">↔️ Mover PDF</h2>
            <p className="text-slate-600 mb-4">
              Moviendo: <span className="font-semibold">{movingPDF.name}</span>
            </p>
            <p className="text-sm text-slate-500 mb-4">
              De: <span className="font-semibold">{movingPDF.app}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Carpeta destino:
              </label>
              <select
                value={movingTo || ''}
                onChange={(e) => setMovingTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:border-blue-500 outline-none"
              >
                <option value="">-- Selecciona una carpeta --</option>
                {APPS.filter((app) => app.id !== movingPDF.app).map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.icon} {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMovingPDF(null)}
                className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMovePDF}
                disabled={!movingTo || moving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors"
              >
                {moving ? 'Moviendo...' : '✓ Mover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPDF ? (
        // PDF Viewer
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">{viewingPDF.app}</p>
              <h2 className="text-xl font-bold">{viewingPDF.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const downloadUrl = `/api/docs/download?app=${encodeURIComponent(viewingPDF.app)}&file=${encodeURIComponent(viewingPDF.name)}`
                  const link = document.createElement('a')
                  link.href = downloadUrl
                  link.download = viewingPDF.name
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                ⬇️ Descargar
              </button>
              <button
                onClick={() => setViewingPDF(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
          <iframe
            src={`/api/docs/view-html?app=${encodeURIComponent(viewingPDF.app)}&file=${encodeURIComponent(viewingPDF.name)}`}
            className="flex-1 border-0"
          />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">Cargando documentos...</p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-8">
                <input
                  type="text"
                  placeholder="🔍 Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500 outline-none"
                />
              </div>

              {/* App Filter */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-3">Filtrar por aplicativo:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className={`p-3 rounded-lg transition-all text-sm font-semibold ${
                      selectedApp === null
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    📋 Todos ({allPDFs.length})
                  </button>
                  {APPS.map((app) => {
                    const count = allPDFs.filter((p) => p.app === app.id).length;
                    return (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-3 rounded-lg transition-all text-sm font-semibold ${
                          selectedApp === app.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {app.icon} {app.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PDF Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPDFs.length > 0 ? (
                  filteredPDFs.map((pdf, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-700 rounded-lg border border-slate-600 group hover:bg-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">📄</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                          {APPS.find((a) => a.id === pdf.app)?.name}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors line-clamp-2 mb-3">
                        {pdf.name.replace(/\.pdf$/i, '')}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingPDF(pdf)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => setMovingPDF(pdf)}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-colors"
                        >
                          ↔️ Mover
                        </button>
                        <button
                          onClick={() => setDeletingPDF(pdf)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-slate-400">No se encontraron documentos</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page: guarded entry point ────────────────────────────────────────────────

export default function BibliotecaPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Check existing session
    const isAuthed = sessionStorage.getItem(SESSION_KEY) === '1';
    setAuthed(isAuthed);
  }, []);

  // Hydration safety: render nothing until client check completes
  if (authed === null) return null;

  if (!authed) {
    return <PasswordGate onSuccess={() => setAuthed(true)} />;
  }

  return <BibliotecaContent />;
}

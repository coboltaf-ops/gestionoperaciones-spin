'use client'

import { useReferenceStore } from '../store/reference-store'
import { referenceTablesList } from '../types'
import { useState } from 'react'
import { LOGO_BASE64 } from '@/shared/lib/logo-base64'
import { usePermisos } from '@/shared/hooks/use-permisos'

const tabActive: React.CSSProperties = { background: 'rgba(96,165,250,0.5)', color: '#fff', border: '1px solid rgba(96,165,250,0.5)' }
const tabInactive: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }

const fmtDate = () => new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })

export function ReferenciasManager() {
  const permisos = usePermisos('referencias')
  const { activeTable, setActiveTable, data, addRecord, updateRecord, deleteRecord } = useReferenceStore()
  const activeData = [...(data[activeTable] || [])].sort((a, b) =>
    a.descripcion.localeCompare(b.descripcion, 'es')
  )

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ descripcion: '', situacion: true, tipo: '+' as '+' | '-', detalle: '', editingId: null as string|null })
  const [formError, setFormError] = useState('')
  const [tab, setTab] = useState<'registros' | 'especificos'>('registros')
  const [reporteFecha, setReporteFecha] = useState('')

  const isTipoAjuste = activeTable === 'tipo_ajuste'
  const isRefProveedor = activeTable === 'referencia_proveedor'
  const activeLabel = referenceTablesList.find(t => t.id === activeTable)?.label || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    const payload = isTipoAjuste
      ? { descripcion: formData.descripcion, situacion: formData.situacion, tipo: formData.tipo }
      : isRefProveedor
      ? { descripcion: formData.descripcion, situacion: formData.situacion, detalle: formData.detalle }
      : { descripcion: formData.descripcion, situacion: formData.situacion }
    try {
      if (formData.editingId) {
        await updateRecord(activeTable, formData.editingId, payload)
      } else {
        await addRecord(activeTable, payload)
      }
      setIsFormOpen(false)
      setFormData({ descripcion: '', situacion: true, tipo: '+', detalle: '', editingId: null })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const openEdit = (record: { id?: string; descripcion: string; situacion: boolean; tipo?: string; detalle?: string }) => {
    setFormData({ descripcion: record.descripcion, situacion: record.situacion, tipo: (record.tipo as '+' | '-') ?? '+', detalle: record.detalle ?? '', editingId: record.id || null })
    setIsFormOpen(true)
  }

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const m = 14

    // Encabezado
    doc.setFillColor(30, 27, 75)
    doc.rect(0, 0, pageW, 28, 'F')
    try { doc.addImage(LOGO_BASE64, 'JPEG', m, 8, 11, 11) } catch { /* */ }
    const lo = 28
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Listado de ${activeLabel}`, lo, 13)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 180, 210)
    doc.text(`Fecha: ${reporteFecha || fmtDate()}`, lo, 21)
    doc.text(`Emitido: ${new Date().toLocaleString('es-VE')}`, pageW - m, 13, { align: 'right' })

    // Cabecera tabla
    let y = 35
    const colWidths = isTipoAjuste ? [20, 90, 30, 30] : [20, 110, 30]
    const colHeaders = isTipoAjuste ? ['#', 'DESCRIPCIÓN', 'TIPO', 'ESTADO'] : ['#', 'DESCRIPCIÓN', 'ESTADO']

    doc.setFillColor(60, 55, 120)
    doc.rect(m, y, pageW - m * 2, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    let x = m
    colHeaders.forEach((h, i) => { doc.text(h, x + 2, y + 5.5); x += colWidths[i] })
    y += 8

    // Filas
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    activeData.forEach((r, ri) => {
      if (y > 270) { doc.addPage(); y = 14 }
      doc.setFillColor(ri % 2 === 0 ? 245 : 255, ri % 2 === 0 ? 245 : 255, ri % 2 === 0 ? 252 : 255)
      doc.rect(m, y, pageW - m * 2, 7, 'F')
      doc.setTextColor(30, 30, 60)
      x = m
      const vals = isTipoAjuste
        ? [String(ri + 1), r.descripcion, r.tipo === '+' ? '+ Entrada' : '- Salida', r.situacion ? 'Activo' : 'Inactivo']
        : [String(ri + 1), r.descripcion, r.situacion ? 'Activo' : 'Inactivo']
      vals.forEach((v, i) => { doc.text(v, x + 2, y + 5); x += colWidths[i] })
      y += 7
    })

    // Total
    y += 3
    doc.setFillColor(30, 64, 175)
    doc.rect(m, y, pageW - m * 2, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`TOTAL REGISTROS: ${activeData.length}`, pageW - m - 2, y + 7, { align: 'right' })

    doc.save(`${activeTable}${reporteFecha ? '-' + reporteFecha.replace(/\//g, '-') : ''}.pdf`)
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="w-full md:w-64 space-y-2">
        {referenceTablesList.map((table) => (
          <button
            key={table.id}
            onClick={() => { setActiveTable(table.id); setTab('registros') }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
              activeTable === table.id
                ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30 shadow-lg'
                : 'glass-panel text-white/70 hover:text-white hover:bg-white/20'
            }`}
          >
            {table.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        <div className="glass-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">{activeLabel}</h2>
            {tab === 'registros' && permisos.editar && (
              <button
                onClick={() => {
                  setFormData({ descripcion: '', situacion: true, tipo: '+', detalle: '', editingId: null })
                  setIsFormOpen(true)
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white font-medium transition-all shadow-md hover:shadow-lg"
              >
                + Nuevo Registro
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setTab('registros')} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all" style={tab === 'registros' ? tabActive : tabInactive}>
              📋 Registros
            </button>
            <button onClick={() => setTab('especificos')} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all" style={tab === 'especificos' ? tabActive : tabInactive}>
              📑 Reportes Específicos
            </button>
          </div>

          {/* Tab: Registros */}
          {tab === 'registros' && (
            <>
              {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-black/20 p-6 rounded-2xl border border-white/10 space-y-4 shadow-inner">
                  {formError && (
                    <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                      {formError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Descripción</label>
                    <input
                      required
                      value={formData.descripcion}
                      onChange={e => setFormData({...formData, descripcion: e.target.value})}
                      className="w-full bg-white/5 focus:bg-white/10 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2 text-white outline-none transition-all"
                      placeholder={`Descripción del ${activeTable}`}
                    />
                  </div>
                  {isRefProveedor && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Detalle de Referencia</label>
                      <input
                        value={formData.detalle}
                        onChange={e => setFormData({...formData, detalle: e.target.value})}
                        className="w-full bg-white/5 focus:bg-white/10 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2 text-white outline-none transition-all"
                        placeholder="Detalle adicional de la referencia"
                      />
                    </div>
                  )}
                  {isTipoAjuste && (
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Tipo de Ajuste</label>
                      <div className="flex gap-4">
                        {(['+', '-'] as const).map(t => (
                          <label key={t} className={`flex items-center gap-2 px-5 py-2 rounded-xl border cursor-pointer transition-all ${formData.tipo === t ? (t === '+' ? 'bg-blue-400/20 border-blue-400/40 text-blue-200' : 'bg-red-500/20 border-red-500/40 text-red-200') : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                            <input type="radio" name="tipo" value={t} checked={formData.tipo === t} onChange={() => setFormData({...formData, tipo: t})} className="sr-only" />
                            <span className="text-xl font-bold">{t}</span>
                            <span className="text-sm">{t === '+' ? 'Entrada / Incremento' : 'Salida / Decremento'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="situacion"
                      checked={formData.situacion}
                      onChange={e => setFormData({...formData, situacion: e.target.checked})}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 checked:bg-blue-400"
                    />
                    <label htmlFor="situacion" className="text-sm text-white/80 cursor-pointer">Activo (Situación)</label>
                  </div>
                  <div className="flex flex-row gap-3 pt-2">
                    <button type="submit" className="bg-blue-400/40 hover:bg-blue-400/60 border border-blue-400/50 text-white px-6 py-2 rounded-xl transition-all font-medium">
                      {formData.editingId ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setIsFormOpen(false)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 px-6 py-2 rounded-xl transition-all">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="text-xs uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-white/90">Descripción</th>
                      {isRefProveedor && <th className="px-6 py-4 font-semibold text-white/90">Detalle de Referencia</th>}
                      {isTipoAjuste && <th className="px-6 py-4 font-semibold text-white/90 w-28 text-center">Tipo</th>}
                      <th className="px-6 py-4 font-semibold text-white/90 w-32">Estado</th>
                      <th className="px-6 py-4 font-semibold text-white/90 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((record) => (
                      <tr key={record.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{record.descripcion}</td>
                        {isRefProveedor && (
                          <td className="px-6 py-4 text-white/70">{record.detalle || '—'}</td>
                        )}
                        {isTipoAjuste && (
                          <td className="px-6 py-4 text-center">
                            {record.tipo === '+' ? (
                              <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-sm font-bold">+</span>
                            ) : (
                              <span className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold">−</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          {record.situacion ? (
                            <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-medium">Activo</span>
                          ) : (
                            <span className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-xs font-medium">Inactivo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {permisos.editar && <button onClick={() => openEdit(record)} className="text-blue-300 hover:text-blue-100 font-medium px-3 py-1 bg-blue-400/10 hover:bg-blue-400/20 rounded-lg transition-all border border-blue-400/0 hover:border-blue-400/30">
                              Editar
                            </button>}
                            {permisos.eliminar && <button
                              onClick={() => {
                                if (confirm('¿Eliminar este registro?')) deleteRecord(activeTable, record.id!)
                              }}
                              className="text-red-300 hover:text-red-100 font-medium px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/0 hover:border-red-500/30"
                            >
                              Eliminar
                            </button>}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {activeData.length === 0 && !isFormOpen && (
                      <tr>
                        <td colSpan={isTipoAjuste ? 4 : isRefProveedor ? 4 : 3} className="px-6 py-12 text-center text-white/50 bg-white/5">
                          No hay registros en {activeLabel}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tab: Reportes Específicos */}
          {tab === 'especificos' && (
            <div>
              <div className="flex items-end gap-4 mb-6 flex-wrap">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Fecha del Reporte (DD/MM/AAAA)</label>
                  <input type="text" value={reporteFecha}
                    onChange={e => { let v = e.target.value.replace(/[^0-9/]/g, ''); if (v.length === 2 && !v.includes('/')) v += '/'; if (v.length === 5 && v.split('/').length === 2) v += '/'; if (v.length <= 10) setReporteFecha(v) }}
                    placeholder="DD/MM/AAAA" className="rounded-xl px-4 py-2.5 text-white outline-none w-48"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>
                <button onClick={generatePDF}
                  className="px-5 py-2.5 rounded-xl font-medium text-white transition-all"
                  style={{ background: 'rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)' }}>
                  📄 Generar PDF — Listado de {activeLabel}
                </button>
              </div>

              {/* Preview */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/10">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="text-xs uppercase bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-white/60 w-16">#</th>
                      <th className="px-6 py-3 font-semibold text-white/60">Descripción</th>
                      {isRefProveedor && <th className="px-6 py-3 font-semibold text-white/60">Detalle de Referencia</th>}
                      {isTipoAjuste && <th className="px-6 py-3 font-semibold text-white/60 w-28 text-center">Tipo</th>}
                      <th className="px-6 py-3 font-semibold text-white/60 w-32">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((record, i) => (
                      <tr key={record.id} className="border-b border-white/5">
                        <td className="px-6 py-3 text-white/50">{i + 1}</td>
                        <td className="px-6 py-3 font-medium text-white">{record.descripcion}</td>
                        {isRefProveedor && (
                          <td className="px-6 py-3 text-white/70">{record.detalle || '—'}</td>
                        )}
                        {isTipoAjuste && (
                          <td className="px-6 py-3 text-center">
                            {record.tipo === '+' ? (
                              <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-sm font-bold">+</span>
                            ) : (
                              <span className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-sm font-bold">−</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-3">
                          {record.situacion ? (
                            <span className="bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-medium">Activo</span>
                          ) : (
                            <span className="bg-red-500/20 text-red-200 border border-red-500/30 px-3 py-1 rounded-full text-xs font-medium">Inactivo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid rgba(96,165,250,0.4)' }}>
                      <td colSpan={isTipoAjuste ? 4 : isRefProveedor ? 4 : 3} className="px-6 py-4 text-right font-bold text-white">
                        Total Registros: <span style={{ color: '#60a5fa' }}>{activeData.length}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

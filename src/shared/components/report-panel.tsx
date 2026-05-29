'use client'

import { useState } from 'react'
import { exportToPDF, exportToExcel, printReport } from '@/shared/lib/export-report'
import { todayColombia } from '@/shared/lib/format-date'
import { useCompanyLogo } from '@/shared/hooks/use-company-logo'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'

export type ReportColumn = {
  header: string
  key: string
  width?: number
}

export type ReportFilter = {
  label: string
  key: string
  options: string[]
}

type Props = {
  title: string
  columns: ReportColumn[]
  rows: Record<string, string | number>[]
  filters?: ReportFilter[]
  filename: string
  summableKeys?: string[]
}

const selStyle: React.CSSProperties = { background: 'rgba(12,26,61,0.9)', border: '1px solid rgba(255,255,255,0.15)' }

const fmtTotal = (n: number) => n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const parseNumericValue = (val: string | number): number => {
  if (typeof val === 'number') return val
  const cleaned = val.replace(/[^0-9.,\-]/g, '').replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export default function ReportPanel({ title: defaultTitle, columns, rows, filters = [], filename, summableKeys = [] }: Props) {
  const companyLogo = useCompanyLogo()
  const empresa = useEmpresaStore(s => s.empresas[0])
  const empresaNombre = empresa?.nombre
  const empresaTipoId = empresa?.tipo_identificacion
  const empresaNroDoc = empresa?.nro_documento
  const empresaDireccion = empresa?.direccion
  const empresaCiudad = empresa?.ciudad
  const [rptTitle, setRptTitle] = useState(defaultTitle)
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set(columns.map(c => c.key)))
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.key, 'Todos']))
  )
  const [isExporting, setIsExporting] = useState(false)

  const toggleCol = (key: string) => {
    setSelectedCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) { if (next.size > 1) next.delete(key) }
      else next.add(key)
      return next
    })
  }

  const selectAll = () => setSelectedCols(new Set(columns.map(c => c.key)))
  const selectNone = () => setSelectedCols(new Set([columns[0].key]))

  const filteredRows = rows.filter(row => {
    return filters.every(f => {
      const val = filterValues[f.key]
      if (val === 'Todos') return true
      return String(row[f.key]) === val
    })
  })

  const visibleCols = columns.filter(c => selectedCols.has(c.key))

  const summableCols = new Set(summableKeys)
  const hasTotals = visibleCols.some(c => summableCols.has(c.key)) && filteredRows.length > 0
  const totals: Record<string, number> = {}
  if (hasTotals) {
    for (const col of visibleCols) {
      if (summableCols.has(col.key)) {
        totals[col.key] = filteredRows.reduce((sum, row) => sum + parseNumericValue(row[col.key]), 0)
      }
    }
  }

  const today = todayColombia()

  const doExport = async (format: 'pdf' | 'excel' | 'print') => {
    setIsExporting(true)
    const opts = { title: rptTitle, columns: visibleCols, rows: filteredRows, filename: `${filename}-${today}`, logo: companyLogo, empresaNombre, empresaTipoId, empresaNroDoc, empresaDireccion, empresaCiudad }
    try {
      if (format === 'pdf') await exportToPDF(opts)
      else if (format === 'excel') await exportToExcel(opts)
      else printReport(opts)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Configurar Reporte</h2>
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm text-white/70 mb-1">Título del Reporte</label>
            <input value={rptTitle} onChange={e => setRptTitle(e.target.value)}
              className="w-full max-w-md rounded-xl px-4 py-2.5 text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          {/* Filtros */}
          {filters.length > 0 && (
            <div>
              <label className="block text-sm text-white/70 mb-2">Filtros</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filters.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-white/50 mb-1">{f.label}</label>
                    <select value={filterValues[f.key]} onChange={e => setFilterValues({ ...filterValues, [f.key]: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-white text-sm outline-none" style={selStyle}>
                      <option value="Todos">Todos</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selector de columnas */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm text-white/70">Columnas a mostrar</label>
              <button onClick={selectAll} className="text-xs px-2 py-0.5 rounded text-blue-300 hover:text-white" style={{ background: 'rgba(96,165,250,0.15)' }}>Todas</button>
              <button onClick={selectNone} className="text-xs px-2 py-0.5 rounded text-white/50 hover:text-white" style={{ background: 'rgba(255,255,255,0.08)' }}>Mínimo</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {columns.map(c => (
                <button key={c.key} onClick={() => toggleCol(c.key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={selectedCols.has(c.key)
                    ? { background: 'rgba(96,165,250,0.3)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.4)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                  }>
                  {c.header}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contador y botones */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="text-white font-semibold">{filteredRows.length}</span> registro{filteredRows.length !== 1 ? 's' : ''} | <span className="text-white font-semibold">{visibleCols.length}</span> columna{visibleCols.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3">
            <button onClick={() => doExport('pdf')} disabled={isExporting || filteredRows.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>
              📄 PDF
            </button>
            <button onClick={() => doExport('excel')} disabled={isExporting || filteredRows.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(96,165,250,0.3)', border: '1px solid rgba(96,165,250,0.4)' }}>
              📊 Excel
            </button>
            <button onClick={() => doExport('print')} disabled={isExporting || filteredRows.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'rgba(96,165,250,0.3)', border: '1px solid rgba(96,165,250,0.4)' }}>
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-sm font-medium text-white/70">Vista previa</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
            <tr>
              {visibleCols.map(col => (
                <th key={col.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {visibleCols.map(col => (
                  <td key={col.key} className="px-4 py-3 text-white/80 text-xs" style={{ maxWidth: '160px', wordWrap: 'break-word', whiteSpace: 'normal' }}>{String(row[col.key] ?? '')}</td>
                ))}
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr><td colSpan={visibleCols.length} className="px-6 py-12 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>No hay datos con los filtros seleccionados</td></tr>
            )}
          </tbody>
          {hasTotals && (
            <tfoot>
              <tr style={{ borderTop: '2px solid rgba(96,165,250,0.4)', background: 'rgba(96,165,250,0.08)' }}>
                {visibleCols.map((col, i) => (
                  <td key={col.key} className="px-4 py-3 text-xs font-bold whitespace-nowrap" style={{ color: '#93c5fd' }}>
                    {i === 0 ? 'TOTALES' : summableCols.has(col.key) ? `$${fmtTotal(totals[col.key])}` : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

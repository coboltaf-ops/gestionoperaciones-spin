'use client'

import { usePersonalEmpresaStore } from '@/features/personal-empresa/store/personal-empresa-store'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  required?: boolean
  disabled?: boolean
  filterCargo?: string  // Si se pasa, solo lista personas con ese cargo
  filterDepartamento?: string  // Si se pasa, solo lista del departamento
}

const defaultSelectSt: React.CSSProperties = {
  background: 'rgba(12,26,61,0.9)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff',
}

export default function PersonalSelector({
  value,
  onChange,
  placeholder = 'Seleccione una persona…',
  className,
  style,
  required,
  disabled,
  filterCargo,
  filterDepartamento,
}: Props) {
  const personal = usePersonalEmpresaStore(s => s.personal)

  const lista = personal
    .filter(p => p.situacion === 'Activo')
    .filter(p => !filterCargo || (p.cargo || '').toLowerCase().includes(filterCargo.toLowerCase()))
    .filter(p => !filterDepartamento || (p.departamento || '').toLowerCase().includes(filterDepartamento.toLowerCase()))
    .map(p => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}`.trim(), cargo: p.cargo, departamento: p.departamento }))

  // Permite mantener un valor previamente guardado aunque ya no exista en personal activo
  const valorEnLista = lista.some(p => p.nombre === value)

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={className ?? 'w-full rounded-xl px-3 py-2 outline-none text-sm'}
      style={style ?? defaultSelectSt}
    >
      <option value="">{placeholder}</option>
      {!valorEnLista && value && (
        <option value={value}>{value} (no listado)</option>
      )}
      {lista.map(p => (
        <option key={p.id} value={p.nombre}>
          {p.nombre}{p.cargo ? ` · ${p.cargo}` : ''}
        </option>
      ))}
    </select>
  )
}

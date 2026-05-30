'use client'

import { ReactNode } from 'react'

interface ActionButtonProps {
  onClick?: () => void
  variant?: 'edit' | 'delete' | 'view' | 'add' | 'approve' | 'reject'
  children: ReactNode
  title?: string
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const variantStyles = {
  edit: {
    background: 'rgba(59, 130, 246, 1)',
    color: '#fff',
    border: '1px solid rgba(59, 130, 246, 0.8)',
    hover: 'hover:bg-blue-600'
  },
  delete: {
    background: 'rgba(239, 68, 68, 1)',
    color: '#fff',
    border: '1px solid rgba(239, 68, 68, 0.8)',
    hover: 'hover:bg-red-600'
  },
  view: {
    background: 'rgba(139, 92, 246, 1)',
    color: '#fff',
    border: '1px solid rgba(139, 92, 246, 0.8)',
    hover: 'hover:bg-purple-600'
  },
  add: {
    background: 'rgba(34, 197, 94, 1)',
    color: '#fff',
    border: '1px solid rgba(34, 197, 94, 0.8)',
    hover: 'hover:bg-green-600'
  },
  approve: {
    background: 'rgba(16, 185, 129, 1)',
    color: '#fff',
    border: '1px solid rgba(16, 185, 129, 0.8)',
    hover: 'hover:bg-emerald-600'
  },
  reject: {
    background: 'rgba(249, 115, 22, 1)',
    color: '#fff',
    border: '1px solid rgba(249, 115, 22, 0.8)',
    hover: 'hover:bg-orange-600'
  }
}

export function ActionButton({
  onClick,
  variant = 'edit',
  children,
  title,
  disabled = false,
  className = '',
  type = 'button'
}: ActionButtonProps) {
  const styles = variantStyles[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles.hover} ${className}`}
      style={{
        background: disabled ? 'rgba(107, 114, 128, 0.5)' : styles.background,
        color: styles.color,
        border: styles.border
      }}
    >
      {children}
    </button>
  )
}

// Formato de números con separadores de miles (,) y decimales (.)
// Ejemplo: 21500.5 → "21,500.50"

export const fmtMoney = (n: number, decimals = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

export const fmtInt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

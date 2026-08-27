import { redirect } from 'next/navigation'

// La Librería de Documentación se desligó de esta app y ahora vive independiente.
export default function BibliotecaRedirect() {
  redirect('https://libreriapalomares.vercel.app')
}

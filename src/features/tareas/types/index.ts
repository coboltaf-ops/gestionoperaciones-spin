export interface Tarea {
  id: string
  nro_tarea: number
  consecutivo: string
  fecha_asignacion: string
  hora_asignacion: string
  persona_asigna_id: string
  persona_asigna_nombre: string
  persona_ejecuta_id: string
  persona_ejecuta_nombre: string
  fecha_requerida_finalizar: string
  fecha_real_finalizacion: string
  descripcion: string
  situacion: string
}

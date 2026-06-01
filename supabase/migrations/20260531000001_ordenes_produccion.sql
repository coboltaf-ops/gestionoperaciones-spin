-- Tabla: Órdenes de Producción (especificación José - 2026-05-31)
CREATE TABLE ordenes_produccion (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificación
  nro_orden integer NOT NULL,
  consecutivo text NOT NULL UNIQUE, -- OP-00001

  -- Campos obligatorios
  fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  cliente_nombre text NOT NULL,
  cantidad_a_producir numeric(12,2) NOT NULL, -- en Kgs

  -- Campos adicionales
  producto_id uuid REFERENCES productos(id) ON DELETE SET NULL,
  producto_nombre text,
  fecha_real_produccion date,
  preparada_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cantidad_real_producida numeric(12,2) DEFAULT 0, -- en Kgs
  observaciones text,

  -- Situación: Solicitada, Ejecutada, Cancelada
  situacion text NOT NULL DEFAULT 'Solicitada' CHECK (situacion IN ('Solicitada', 'Ejecutada', 'Cancelada')),

  -- Auditoría
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid NOT NULL
);

-- Índices para performance
CREATE INDEX idx_ordenes_produccion_cliente ON ordenes_produccion(cliente_id);
CREATE INDEX idx_ordenes_produccion_producto ON ordenes_produccion(producto_id);
CREATE INDEX idx_ordenes_produccion_situacion ON ordenes_produccion(situacion);
CREATE INDEX idx_ordenes_produccion_empresa ON ordenes_produccion(empresa_id);
CREATE INDEX idx_ordenes_produccion_fecha ON ordenes_produccion(fecha_registro);

-- RLS (Row Level Security)
ALTER TABLE ordenes_produccion ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see orders from their company
CREATE POLICY ordenes_produccion_company_isolation ON ordenes_produccion
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY ordenes_produccion_insert ON ordenes_produccion
  FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY ordenes_produccion_update ON ordenes_produccion
  FOR UPDATE
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY ordenes_produccion_delete ON ordenes_produccion
  FOR DELETE
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

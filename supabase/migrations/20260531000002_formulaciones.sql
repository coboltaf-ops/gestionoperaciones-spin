-- Tabla: Formulaciones (BOM - Bill of Materials)
CREATE TABLE formulaciones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificación
  nro_formula integer NOT NULL,
  consecutivo text NOT NULL UNIQUE, -- FORM-00001

  -- Producto Terminado
  producto_terminado_id uuid NOT NULL,
  producto_terminado_codigo text NOT NULL,
  producto_terminado_nombre text NOT NULL,
  unidad_medida text NOT NULL,

  -- Metadatos
  nombre_formula text,
  descripcion text,

  -- Estado: Activa, Inactiva
  situacion text NOT NULL DEFAULT 'Activa' CHECK (situacion IN ('Activa', 'Inactiva')),

  -- Auditoría
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  empresa_id uuid NOT NULL
);

-- Índices
CREATE INDEX idx_formulaciones_producto ON formulaciones(producto_terminado_id);
CREATE INDEX idx_formulaciones_empresa ON formulaciones(empresa_id);
CREATE INDEX idx_formulaciones_situacion ON formulaciones(situacion);

-- Tabla: Renglones de Formulación (Materia Prima necesaria)
CREATE TABLE formulaciones_renglones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referencia a Formulación
  formulacion_id uuid NOT NULL REFERENCES formulaciones(id) ON DELETE CASCADE,

  -- Materia Prima
  producto_id uuid NOT NULL,
  producto_codigo text NOT NULL,
  producto_nombre text NOT NULL,
  unidad_medida text NOT NULL,

  -- Cantidad necesaria para 1 unidad del Producto Terminado
  cantidad_necesaria numeric(12,4) NOT NULL,

  -- Orden del renglon
  numero_renglon integer NOT NULL,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX idx_formulaciones_renglones_formulacion ON formulaciones_renglones(formulacion_id);
CREATE INDEX idx_formulaciones_renglones_producto ON formulaciones_renglones(producto_id);

-- RLS (Row Level Security)
ALTER TABLE formulaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulaciones_renglones ENABLE ROW LEVEL SECURITY;

-- Policies para formulaciones
CREATE POLICY formulaciones_company_isolation ON formulaciones
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_insert ON formulaciones
  FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_update ON formulaciones
  FOR UPDATE
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_delete ON formulaciones
  FOR DELETE
  USING (
    empresa_id IN (
      SELECT id FROM empresas WHERE id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

-- Policies para renglones (heredar aislamiento de formulación padre)
CREATE POLICY formulaciones_renglones_select ON formulaciones_renglones
  FOR SELECT
  USING (
    formulacion_id IN (
      SELECT id FROM formulaciones WHERE empresa_id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_renglones_insert ON formulaciones_renglones
  FOR INSERT
  WITH CHECK (
    formulacion_id IN (
      SELECT id FROM formulaciones WHERE empresa_id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_renglones_update ON formulaciones_renglones
  FOR UPDATE
  USING (
    formulacion_id IN (
      SELECT id FROM formulaciones WHERE empresa_id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

CREATE POLICY formulaciones_renglones_delete ON formulaciones_renglones
  FOR DELETE
  USING (
    formulacion_id IN (
      SELECT id FROM formulaciones WHERE empresa_id = CURRENT_SETTING('app.empresa_id', true)::uuid
    )
  );

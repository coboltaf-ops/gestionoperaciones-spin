-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tablas de Referencias

CREATE TABLE tipo_identificacion (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE tipo_inventario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE categoria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE grupo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE subgrupo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE unidad_medida (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE condiciones_pago (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  dias integer NOT NULL DEFAULT 0,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE tipo_moneda (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  simbolo text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE actividad_proveedor (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Módulos Base

CREATE TABLE centro_costo (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo text NOT NULL UNIQUE,
  descripcion text NOT NULL,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE bodega (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  correo text,
  telefono text,
  direccion text,
  ciudad text,
  pais text,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE proveedor (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  tipo_id text NOT NULL,
  nro_documento text NOT NULL UNIQUE,
  id_actividad uuid REFERENCES actividad_proveedor(id),
  correo text,
  telf_oficina text,
  movil_oficina text,
  persona_contacto text,
  referencias text,
  direccion text,
  ciudad text,
  pais text,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE producto (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo text NOT NULL UNIQUE,
  descripcion text NOT NULL,
  id_tipo_inventario uuid REFERENCES tipo_inventario(id),
  id_categoria uuid REFERENCES categoria(id),
  id_grupo uuid REFERENCES grupo(id),
  id_sub_grupo uuid REFERENCES subgrupo(id),
  ult_costo numeric(12, 2) DEFAULT 0,
  ult_proveedor uuid REFERENCES proveedor(id),
  maximo numeric(12, 2) DEFAULT 0,
  minimo numeric(12, 2) DEFAULT 0,
  id_unidad_medida uuid REFERENCES unidad_medida(id),
  existencia numeric(12, 2) DEFAULT 0,
  situacion boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Órdenes de Compra

CREATE TABLE orden_compra (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nro_orden serial UNIQUE,
  consecutivo text UNIQUE,
  fecha_emision date NOT NULL,
  fecha_vencimiento date NOT NULL,
  id_proveedor uuid REFERENCES proveedor(id) NOT NULL,
  fecha_llegada date,
  id_comprador uuid, -- Debería enlazar a auth.users cuando se setup Supabase Auth
  id_condicion_pago uuid REFERENCES condiciones_pago(id),
  id_tipo_moneda_id uuid REFERENCES tipo_moneda(id),
  fecha_aprobacion date,
  subtotal_antes_impuesto numeric(12, 2) DEFAULT 0,
  pct_impuesto numeric(5, 2) DEFAULT 0,
  monto_impuesto numeric(12, 2) DEFAULT 0,
  total_factura numeric(12, 2) DEFAULT 0,
  observaciones text,
  situacion text DEFAULT 'Pendiente',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE orden_compra_detalle (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_orden uuid REFERENCES orden_compra(id) ON DELETE CASCADE NOT NULL,
  codigo_producto text NOT NULL,
  descripcion text NOT NULL,
  cantidad numeric(12, 2) NOT NULL,
  costo_unitario numeric(12, 2) NOT NULL,
  id_unidad_medida uuid REFERENCES unidad_medida(id),
  subtotal numeric(12, 2) NOT NULL,
  recibido boolean DEFAULT false
);

-- RLS (Row Level Security) basics - Permitimos acceso total al comienzo (después controlaremos por roles)
alter table tipo_inventario enable row level security;
alter table categoria enable row level security;
alter table grupo enable row level security;
alter table subgrupo enable row level security;
alter table unidad_medida enable row level security;
alter table condiciones_pago enable row level security;
alter table tipo_moneda enable row level security;
alter table actividad_proveedor enable row level security;
alter table centro_costo enable row level security;
alter table bodega enable row level security;
alter table proveedor enable row level security;
alter table producto enable row level security;
alter table orden_compra enable row level security;
alter table orden_compra_detalle enable row level security;

-- Policies temporales (permitir todo)
create policy "Allow all operations for authenticated users" on tipo_inventario for all using (true);
create policy "Allow all operations for authenticated users" on categoria for all using (true);
create policy "Allow all operations for authenticated users" on grupo for all using (true);
create policy "Allow all operations for authenticated users" on subgrupo for all using (true);
create policy "Allow all operations for authenticated users" on unidad_medida for all using (true);
create policy "Allow all operations for authenticated users" on condiciones_pago for all using (true);
create policy "Allow all operations for authenticated users" on tipo_moneda for all using (true);
create policy "Allow all operations for authenticated users" on actividad_proveedor for all using (true);
create policy "Allow all operations for authenticated users" on centro_costo for all using (true);
create policy "Allow all operations for authenticated users" on bodega for all using (true);
create policy "Allow all operations for authenticated users" on proveedor for all using (true);
create policy "Allow all operations for authenticated users" on producto for all using (true);
create policy "Allow all operations for authenticated users" on orden_compra for all using (true);
create policy "Allow all operations for authenticated users" on orden_compra_detalle for all using (true);

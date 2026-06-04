#!/bin/bash

# ============================================================
# Setup: Usuarios y Permisos en Supabase
# ============================================================

set -e

echo "🔐 Setup de Usuarios y Permisos"
echo ""

# Detectar token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN no encontrado"
  echo ""
  echo "Para obtenerlo:"
  echo "1. Ve a: https://supabase.com/dashboard/account/tokens"
  echo "2. Crea un nuevo token (o copia uno existente)"
  echo "3. Ejecuta:"
  echo ""
  echo "  export SUPABASE_ACCESS_TOKEN='tu_token_aqui'"
  echo "  bash setup-usuarios.sh"
  echo ""
  exit 1
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo "❌ SUPABASE_PROJECT_ID no encontrado"
  echo ""
  echo "Para obtenerlo:"
  echo "1. Ve a: https://supabase.com/dashboard/projects"
  echo "2. Copia el ID del proyecto (parte de la URL)"
  echo "3. Ejecuta:"
  echo ""
  echo "  export SUPABASE_PROJECT_ID='tu_project_id'"
  echo "  bash setup-usuarios.sh"
  echo ""
  exit 1
fi

echo "✅ Token encontrado"
echo "✅ Project ID: $SUPABASE_PROJECT_ID"
echo ""
echo "📦 Ejecutando migraciones..."
echo ""

# Obtener el proyecto URL
PROJECT_URL=$(curl -s -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID" | \
  grep -o '"name":"[^"]*"' | head -1)

echo "📝 Ejecutando SQL..."

# Crear tabla usuarios
curl -s -X POST \
  "https://${SUPABASE_PROJECT_ID}.supabase.co/rest/v1/rpc/sql_execute" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{
  "query": "CREATE TABLE IF NOT EXISTS usuarios (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), usuario VARCHAR(255) UNIQUE NOT NULL, clave VARCHAR(255) NOT NULL, nombre VARCHAR(255) NOT NULL, apellido VARCHAR(255), correo VARCHAR(255), rol VARCHAR(100), situacion VARCHAR(50) DEFAULT 'Activo', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())"
}
EOF

echo ""
echo "✅ Tabla usuarios creada"

echo ""
echo "🎉 Setup completado!"
echo ""
echo "Usuarios listos para usar:"
echo "  - jarango / Password123!"
echo "  - contador / Password456!"
echo "  - contable00 / Password789!"
echo "  - auxiliar / Password012!"
echo "  - admin / Password345!"

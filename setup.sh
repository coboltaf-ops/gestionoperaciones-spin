#!/bin/bash

echo "🔐 Setup de Usuarios y Permisos - SPIN"
echo "======================================"
echo ""
echo "Necesito tu SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Para obtenerlo (toma 10 segundos):"
echo "1. Abre: https://supabase.com/dashboard/account/tokens"
echo "2. O ve a tu dashboard y Settings → API"
echo "3. Copia el 'service_role secret' (el string largo)"
echo "4. Pégalo abajo y presiona ENTER"
echo ""

read -p "Pega tu SERVICE_ROLE_KEY: " SERVICE_KEY

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ No pusiste nada"
  exit 1
fi

# Agregar al .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" >> .env.local

echo ""
echo "✅ Clave agregada a .env.local"
echo ""
echo "🚀 Iniciando servidor..."
npm run dev

#!/bin/sh

# =======================================================
# Script de Entrada para Docker (Entrypoint)
# =======================================================

# 1. Definir valores por defecto si no están configurados en el entorno.
# -------------------------------------------------------------------
# Puerto en el que Astro escuchará dentro del contenedor (por defecto 4321)
SERVER_PORT=${SERVER_PORT:-4321}
# Nivel de depuración (útil para Node.js). Si se establece, activa el modo de mantenimiento/debug.
DEBUG_MODE=${DEBUG:-""}

# 2. Exportar variables de entorno (útil si se necesitan en otros comandos o en la app)
# ---------------------------------------------------------------------------------
export SERVER_PORT
export DEBUG_MODE

# Opcional: Mostrar la configuración antes de iniciar
echo "--------------------------------------------------------"
echo "  🚀 Iniciando el servidor Astro..."
echo "  Puerto Interno (SERVER_PORT): $SERVER_PORT"
echo "  Modo Debug (DEBUG): $DEBUG_MODE"
echo "--------------------------------------------------------"

# 3. Iniciar el servidor Astro o entrar en modo Debug
# --------------------------------------------------

# Verifica si la variable DEBUG_MODE (basada en la variable DEBUG) tiene contenido (-n)
if [ -n "$DEBUG_MODE" == "true" ]; then
    echo "  ⚠️  Modo DEBUG activado. El servidor NO se iniciará automáticamente."
    echo "  El contenedor se mantendrá vivo con 'tail -f /dev/null'."
    echo "  Usa 'make shell' y ejecuta 'bun dev' manualmente si lo necesitas."
    exec tail -f /dev/null
else
    exec bun dev --port $SERVER_PORT
fi

# Variables
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = hema-landing
SERVICE_NAME = app
# Comando base de Docker Compose
DOCKER_COMPOSE = docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME)

.PHONY: build up down restart logs shell install help

# -----------------
# Comandos de Ciclo de Vida del Contenedor
# -----------------

# Construye la imagen Docker del servicio 'app'. Útil para la primera vez o si cambias el Dockerfile.
build:
	@echo "-> Construyendo la imagen $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) build $(SERVICE_NAME)

# up: Inicia los contenedores en modo 'detached' (segundo plano).
up:
	@echo "-> Levantando los contenedores de $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) up -d

# down: Detiene y elimina los contenedores, redes y volúmenes definidos.
down:
	@echo "-> Deteniendo y eliminando los contenedores de $(PROJECT_NAME)..."
	$(DOCKER_COMPOSE) down --remove-orphans

# restart: Reinicia el servicio 'app' (down + up)
restart: down up
	@echo "-> Reiniciando el servicio $(SERVICE_NAME)."

# logs: Muestra los logs en tiempo real del servicio 'app'
logs:
	@echo "-> Mostrando logs del servicio $(SERVICE_NAME). Presiona Ctrl+C para salir."
	$(DOCKER_COMPOSE) logs -f $(SERVICE_NAME)

# -----------------
# Comandos de Desarrollo
# -----------------

# shell: Abre una shell interactiva dentro del contenedor en ejecución
shell:
	@echo "-> Abriendo bash shell en el contenedor $(SERVICE_NAME)..."
	# Intentamos 'bash', si falla, usamos 'sh' (común en imágenes alpine)
	$(DOCKER_COMPOSE) exec $(SERVICE_NAME) bash

# install: Instala o actualiza las dependencias dentro del contenedor (asumiendo bun)
# Usa este comando si añades o modificas 'package.json'.
install:
	@echo "-> Instalando dependencias dentro del contenedor..."
	$(DOCKER_COMPOSE) exec $(SERVICE_NAME) bun install
	@echo "-> Dependencias instaladas. El servidor de desarrollo se reiniciará automáticamente."

# -----------------
# Tarea por defecto (muestra ayuda)
# -----------------

help:
	@echo ""
	@echo "Docker Compose Makefile para $(PROJECT_NAME) (Astro/Node.js)"
	@echo ""
	@echo "Uso: make [comando]"
	@echo ""
	@echo "Comandos disponibles:"
	@echo "  build    - Construye la imagen de Docker."
	@echo "  up       - Inicia los contenedores en segundo plano (detached)."
	@echo "  down     - Detiene y elimina los contenedores."
	@echo "  restart  - Reinicia los contenedores (down + up)."
	@echo "  logs     - Muestra los logs en tiempo real."
	@echo "  shell    - Abre una shell interactiva dentro del contenedor (usa bash/sh)."
	@echo "  install  - Ejecuta 'bun install' dentro del contenedor."
	@echo "  help     - Muestra esta ayuda."
	@echo ""

.DEFAULT_GOAL := help
.PHONY: help install dev setup migrate upgrade downgrade run shell test clean status seed seed-admin reset-admin

help:
	@echo "Portfolio backend (Lcore + PostgreSQL)"
	@echo ""
	@echo "Quick start:"
	@echo "  make install      Install dependencies via uv"
	@echo "  make setup        Create .env if missing, validate DATABASE_URL"
	@echo "  make upgrade      Apply pending migrations"
	@echo "  make seed         Seed admin user (idempotent)"
	@echo "  make run          Start dev server on :8080"
	@echo ""
	@echo "Database:"
	@echo "  make migrate msg=\"describe change\"   Generate a new migration"
	@echo "  make upgrade      Apply pending migrations"
	@echo "  make downgrade    Roll back one migration"
	@echo "  make db-reset     Drop and recreate all tables (DESTRUCTIVE)"
	@echo "  make seed         Seed admin user (only one allowed)"
	@echo "  make reset-admin  Rotate admin password from .env"
	@echo ""
	@echo "Run:"
	@echo "  make run          Start dev server on :8080"
	@echo "  make shell        Open Python shell with models loaded"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        Remove __pycache__ and .pyc files"
	@echo "  make status       Show env + db status"

install:
	uv sync

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ""; \
		echo "Created .env from .env.example"; \
		echo "Next: edit .env and set DATABASE_URL to your Neon/Postgres connection string"; \
		echo "Get a free DB at https://neon.tech"; \
		echo ""; \
		exit 0; \
	fi
	@echo ".env already exists, leaving it alone."
	@if grep -q "postgresql://user:password@" .env; then \
		echo ""; \
		echo "WARNING: DATABASE_URL in .env still has placeholder values."; \
		echo "Edit .env and replace with your real Neon/Postgres URL."; \
		echo ""; \
	else \
		echo "DATABASE_URL looks configured."; \
	fi

status:
	@if [ -f .env ]; then \
		echo ".env: present"; \
		URL=$$(grep "^DATABASE_URL=" .env | cut -d= -f2-); \
		if echo "$$URL" | grep -q "user:password@"; then \
			echo "DATABASE_URL: PLACEHOLDER (edit .env)"; \
		elif [ -z "$$URL" ]; then \
			echo "DATABASE_URL: NOT SET"; \
		else \
			echo "DATABASE_URL: configured"; \
		fi; \
	else \
		echo ".env: missing (run 'make setup')"; \
	fi

migrate:
	@if [ -z "$(msg)" ]; then \
		echo "Usage: make migrate msg=\"describe your change\""; \
		exit 1; \
	fi
	alembic revision --autogenerate -m "$(msg)"

upgrade:
	alembic upgrade head

downgrade:
	alembic downgrade -1

db-reset:
	@echo "WARNING: This drops all tables. Press Ctrl-C to abort."
	@read -p "Continue? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	alembic downgrade base
	alembic upgrade head

run:
	python main.py

seed:
	python seed.py

seed-admin: seed

reset-admin:
	python -c "from admin.cli import reset_admin; reset_admin()"

shell:
	uv run python -c "from db import *; import db.models; import IPython; IPython.embed()"

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

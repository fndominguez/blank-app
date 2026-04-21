#!/usr/bin/env python3
"""
Export the FastAPI OpenAPI schema to a static JSON file.
Run without a running server: python scripts/export_openapi.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Ensure the backend root is on the path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Provide minimal env vars so the app can import without a real .env
os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@localhost/db")
os.environ.setdefault("SECRET_KEY", "export-script-placeholder-key-do-not-use-in-prod")

from app.main import app

output_path = Path(__file__).parent.parent / "openapi.json"
schema = app.openapi()
output_path.write_text(json.dumps(schema, indent=2))
sys.stdout.write(f"OpenAPI schema written to {output_path}\n")

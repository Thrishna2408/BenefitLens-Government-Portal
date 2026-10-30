import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_path))

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("Starting BenefitLens Backend on http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/docs")
    print("Tagline: Making Government Benefits Transparent, Traceable, and Accountable.")
    print("=" * 60)
    os.chdir(str(backend_path))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

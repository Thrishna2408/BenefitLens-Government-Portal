@echo off
title BenefitLens - Transparent Government Benefit Disbursement Tracker Launcher
echo ========================================================
echo Starting BenefitLens Backend (FastAPI on Port 8000)...
echo ========================================================
start cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo ========================================================
echo Starting BenefitLens Frontend (Vite on Port 5173)...
echo ========================================================
start cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both BenefitLens servers have been launched!
echo Backend:  http://127.0.0.1:8000 (Interactive Docs at http://127.0.0.1:8000/docs)
echo Frontend: http://127.0.0.1:5173/
echo.
pause

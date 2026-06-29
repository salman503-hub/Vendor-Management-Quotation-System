@echo off
title Vendor Management ^& Quotation System (Full-Stack React)
echo =======================================================================
echo     Teyzix Vendor Management ^& Quotation System (React) Setup ^& Run
echo =======================================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your PATH environment variable.
    echo Please install Python 3.x and try again.
    pause
    exit /b
)

:: Check Node installation
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. React frontend cannot be built.
    echo Please install Node.js (which includes npm) and try again.
    pause
    exit /b
)

echo [INFO] Installing Python dependencies...
python -m pip install -r requirements.txt

echo.
echo [INFO] Installing frontend NPM dependencies (React/Vite)...
cd frontend
call npm install
echo.
echo [INFO] Compiling React frontend...
call node node_modules/vite/bin/vite.js build
cd ..

echo.
echo [INFO] Applying database migrations...
python manage.py migrate

echo.
echo [INFO] Seeding database with demo records...
python create_demo_data.py

echo.
echo =======================================================================
echo          System Ready! Access it at: http://127.0.0.1:8000/
echo          Default Credentials:
echo          - Username: admin
echo          - Password: admin123
echo =======================================================================
echo.
echo Starting Django development server (Ctrl+C to stop)...
python manage.py runserver 127.0.0.1:8000

pause

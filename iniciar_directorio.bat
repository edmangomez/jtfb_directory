@echo off
title JTFB Directorio Telefonico Cisco
cd /d "%~dp0"

echo ==========================================================
echo   Iniciando Directorio Telefonico JTFB Cisco...
echo ==========================================================

:: Verificar que node este disponible
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Si no existe node_modules, ejecutar npm install
if not exist node_modules (
    echo Instalando dependencias necesarias (solo la primera vez)...
    call npm install
)

:: Si no existe dist, compilar
if not exist dist (
    echo Compilando aplicacion web optimizada...
    call npm run build
)

:: Iniciar launcher
node scripts/launcher.js
pause

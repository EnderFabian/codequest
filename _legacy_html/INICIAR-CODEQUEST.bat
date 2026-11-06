@echo off
title CodeQuest - Servidor local
cd /d "%~dp0"
echo.
echo  ========================================
echo    CodeQuest - Iniciando servidor...
echo  ========================================
echo.
echo  Abre en el navegador:
echo    http://localhost:3000
echo.
echo  Para cerrar: Ctrl+C en esta ventana
echo.
start "" "http://localhost:3000"
npx --yes serve . -p 3000

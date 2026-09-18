@echo off
title Nomina - Plan Medico Salud Zulia
echo ==========================================
echo   Plan Medico Salud Zulia - Nomina
echo   Iniciando servidores...
echo ==========================================
echo.

cd /d "C:\Users\Usuario\.gemini\antigravity\scratch\nomina-salud-zulia"

:: Iniciar backend en segundo plano
start /min cmd /c "title Backend Nomina && node server.js"

:: Esperar 2 segundos para que el backend arranque
timeout /t 2 /nobreak >nul

:: Iniciar frontend en segundo plano
start /min cmd /c "title Frontend Nomina && npm run dev"

:: Esperar 3 segundos para que Vite arranque
timeout /t 3 /nobreak >nul

:: Abrir navegador
start http://localhost:5176

echo.
echo ==========================================
echo   Aplicacion iniciada correctamente!
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:5176
echo ==========================================
echo.
echo Puedes cerrar esta ventana.
echo Para detener la app, cierra las ventanas
echo "Backend Nomina" y "Frontend Nomina".
pause

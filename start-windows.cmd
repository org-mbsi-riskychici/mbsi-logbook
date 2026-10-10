@echo off
if not exist .os-marker goto install
set /p OS=<.os-marker
if not "%OS%"=="windows" goto install
goto run

:install
echo Setup untuk Windows...
if exist node_modules rmdir /s /q node_modules
call npm install
echo windows>.os-marker

:run
call npm run dev
@echo off
setlocal

echo Checking for Node.js...

where node >nul 2>nul
if %errorlevel%==0 (
    echo Node.js is already installed.
) else (
    echo Node.js not found. Installing...

    set DOWNLOAD_URL=https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
    set INSTALLER=node-install.msi

    echo Downloading Node.js from:
    echo %DOWNLOAD_URL%

    powershell -Command "(New-Object Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%INSTALLER%')"

    echo Running Node installer...
    msiexec /i "%INSTALLER%" /quiet /norestart

    echo Waiting for Node installation to finish...
    timeout /t 10 >nul

    del "%INSTALLER%"
    echo Node.js installed.
)

echo Installing project dependencies...
npm install

echo Starting server...
start "" /B node server.js

echo Server started.

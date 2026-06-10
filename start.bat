@echo off
title Khoi dong Beaverdash System
echo ==========================================
echo   KHOI DONG HE THONG BEAVERDASH LOCAL
echo ==========================================
echo.

echo [1/2] Dang khoi dong cac container Docker...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Khong the khoi dong Docker Compose. Vui long kiem tra Docker Desktop da mo chua.
    pause
    exit /b %ERRORLEVEL%
)
echo [OK] Docker Compose da khoi dong thanh cong.
echo.

echo [2/2] Dang khoi dong Cloudflare Tunnel (api.beaverdash.xyz)...
echo Giu nguyen cua so nay de duy tri ket noi. Nhan Ctrl+C de dung tunnel.
echo.
cloudflared tunnel run --url http://localhost:5000 beaverdash-backend
pause

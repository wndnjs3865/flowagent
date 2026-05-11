@echo off
chcp 65001 > nul
cd /d "%~dp0"
title FlowAgent - 자동 설치 + 실행
echo.
echo ============================================
echo  FlowAgent ^| 더블클릭 한 번으로 설치부터 실행까지
echo ============================================
echo.

REM ── 1/4 Node.js 체크 ─────────────────────────
where node >nul 2>&1
if errorlevel 1 (
  echo [오류] Node.js가 설치되지 않았습니다.
  echo.
  echo Node.js 다운로드 페이지를 자동으로 엽니다.
  echo "LTS" 초록 버튼을 눌러 .msi 파일을 받고 더블클릭으로 설치하세요.
  echo 설치가 끝나면 이 start.bat 을 다시 더블클릭하면 됩니다.
  echo.
  start https://nodejs.org/
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
echo [1/4] Node.js 확인 완료 (%NODE_VER%)

REM ── 2/4 pnpm 준비 (corepack 우선, fallback: npm) ────
echo [2/4] pnpm 준비 중...
call corepack enable >nul 2>&1
call corepack prepare pnpm@latest --activate >nul 2>&1
where pnpm >nul 2>&1
if errorlevel 1 (
  echo       corepack 미동작 - npm 으로 pnpm 설치합니다.
  call npm i -g pnpm
  if errorlevel 1 (
    echo [오류] pnpm 설치 실패. 인터넷 연결을 확인하고 다시 시도하세요.
    pause
    exit /b 1
  )
)
echo       pnpm 준비 완료.

REM ── 3/4 .env 파일 + API 키 ────────────────────
echo [3/4] .env 파일 준비 중...
if not exist .env (
  copy .env.example .env > nul
  echo.
  echo ============================================
  echo  Anthropic API 키 입력
  echo ============================================
  echo 1. Enter 를 누르면 메모장이 열립니다.
  echo 2. 첫 줄 ANTHROPIC_API_KEY= 뒤에 본인 키를 붙여넣으세요.
  echo 3. Ctrl+S 로 저장한 뒤 메모장을 닫으면 자동으로 계속 진행됩니다.
  echo.
  echo (API 키가 없으면: https://console.anthropic.com/settings/keys 에서 발급)
  echo.
  pause
  start /wait notepad .env
) else (
  echo       기존 .env 파일이 있습니다. 건너뜁니다.
)

REM ── 4/4 의존성 설치 + 서버 시작 ──────────────
echo [4/4] 의존성 설치 중... (1-2분 소요)
call pnpm install
if errorlevel 1 (
  echo [오류] pnpm install 실패. 인터넷 또는 사내 방화벽을 확인하세요.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  서버를 시작합니다.
echo  3초 뒤 브라우저가 자동으로 열립니다 (http://localhost:3000).
echo  이 창은 닫지 마세요 - 닫으면 서버도 꺼집니다.
echo ============================================
echo.

REM 브라우저 자동 열기 (3초 후, 백그라운드)
start "" cmd /c "timeout /t 3 > nul & start http://localhost:3000"

call pnpm dev
echo.
echo 서버가 종료되었습니다. 다시 시작하려면 start.bat 을 다시 더블클릭하세요.
pause

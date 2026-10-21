@echo off
chcp 65001 > nul
title Excel Sequence Studio Launcher

echo ==========================================================
echo   Excel Sequence Studio - Visual No-Code HMI Studio
echo   오프라인 독립 서브 프로그램 실행기
echo ==========================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
  echo [1/2] 최초 실행: 로컬 의존성 패키지 확인 및 설치 중...
  call npm install
  if %errorlevel% neq 0 (
    echo [오류] npm 패키지 설치에 실패하였습니다. Node.js 설치를 확인하세요.
    pause
    exit /b %errorlevel%
  )
)

echo [2/2] Excel Sequence Studio 스튜디오 서버 구동 중... (포트 5174)
start "" http://localhost:5174
call npm run dev -- --host

pause

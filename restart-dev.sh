#!/bin/bash

cd "$(dirname "$0")"

echo "Restarting development servers..."
echo ""

# 기존 프로세스 종료
./stop-dev.sh

# 잠깐 대기
sleep 2

# 새로 시작
./start-dev.sh

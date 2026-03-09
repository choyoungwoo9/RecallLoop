#!/bin/bash

cd "$(dirname "$0")"

echo "Starting development servers..."
echo ""

# BE (포트 8080) 시작
echo "Starting BE (port 8080)..."
cd BE
nohup ./gradlew bootRun > /tmp/be.log 2>&1 &
BE_PID=$!
echo "✓ BE started (PID: $BE_PID)"
cd ..

# FE (포트 5173) 시작
echo "Starting FE (port 5173)..."
cd FE
nohup npm run dev > /tmp/fe.log 2>&1 &
FE_PID=$!
echo "✓ FE started (PID: $FE_PID)"
cd ..

echo ""
echo "============================================"
echo "✓ All development servers started"
echo "============================================"
echo ""
echo "Services:"
echo "  BE: http://localhost:8080 (PID: $BE_PID)"
echo "  FE: http://localhost:5173 (PID: $FE_PID)"
echo ""
echo "Logs:"
echo "  tail -f /tmp/be.log    (Backend logs)"
echo "  tail -f /tmp/fe.log    (Frontend logs)"
echo ""
echo "Stop all servers:"
echo "  ./stop-dev.sh"
echo ""

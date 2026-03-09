#!/bin/bash

echo "Stopping development servers..."
echo ""

# BE (포트 8080) 종료
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Killing process on port 8080 (BE)..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    echo "✓ Port 8080 stopped"
fi

# FE (포트 5173) 종료
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Killing process on port 5173 (FE)..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "✓ Port 5173 stopped"
fi

echo ""
echo "All development servers stopped"

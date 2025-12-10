#!/bin/bash

echo "🌐 Starting Fast Loan in Network Mode..."
echo "📍 Your IP: 10.212.189.193"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Start backend in background
echo -e "${GREEN}🔧 Starting Backend...${NC}"
cd /home/chirag/Fast_Loan/backend
npm start > /tmp/fastloan-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 5

# Start frontend with network config
echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd /home/chirag/Fast_Loan
cp .env.network .env
npm run dev > /tmp/fastloan-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

sleep 3

echo ""
echo -e "${GREEN}✅ Services Started!${NC}"
echo ""
echo -e "${YELLOW}📱 Share this URL with your friend:${NC}"
echo "   http://10.212.189.193:3001"
echo ""
echo -e "${YELLOW}🔗 API Endpoint:${NC}"
echo "   http://10.212.189.193:5000/api/v1"
echo ""
echo -e "${YELLOW}🔑 Login Credentials:${NC}"
echo "   Admin:  admin@fastloan.com / password123"
echo "   Client: john.doe@email.com / password123"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo "   Backend:  tail -f /tmp/fastloan-backend.log"
echo "   Frontend: tail -f /tmp/fastloan-frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait and handle shutdown
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Services stopped'; exit" INT TERM

wait

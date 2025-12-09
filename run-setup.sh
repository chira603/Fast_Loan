#!/bin/bash

echo "================================================"
echo "  🚀 FAST LOAN - Easy Setup with Docker"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Start PostgreSQL with Docker
echo "Step 1: Starting PostgreSQL Database with Docker..."
echo "---------------------------------------------------"

if ! docker ps | grep -q fastloan-postgres; then
    echo "Starting PostgreSQL container..."
    docker-compose up -d postgres
    
    echo "Waiting for database to be ready..."
    sleep 5
    
    echo -e "${GREEN}✓ Database is ready!${NC}"
else
    echo -e "${GREEN}✓ Database is already running${NC}"
fi

echo ""

# Step 2: Backend Setup
echo "Step 2: Setting up Backend..."
echo "---------------------------------------------------"

cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastloan_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=fast_loan_secret_key_change_in_production
JWT_EXPIRE=30d

FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=10
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies (this may take a minute)..."
    npm install --quiet
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

cd ..

echo ""

# Step 3: Frontend Setup
echo "Step 3: Setting up Frontend..."
echo "---------------------------------------------------"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies (this may take a minute)..."
    npm install --quiet
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo ""
echo "================================================"
echo "  ✅ Setup Complete!"
echo "================================================"
echo ""
echo "Test Credentials (from sample data):"
echo -e "  ${YELLOW}Admin:${NC}  admin@fastloan.com / password123"
echo -e "  ${YELLOW}Client:${NC} john.doe@email.com / password123"
echo ""
echo "================================================"
echo "  🎯 Next: Start the Application"
echo "================================================"
echo ""
echo "Open TWO separate terminals and run:"
echo ""
echo -e "${GREEN}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Terminal 2 - Frontend:${NC}"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "================================================"
echo ""
echo "To stop database later:"
echo "  docker-compose down"
echo ""
echo "To view database:"
echo "  docker exec -it fastloan-postgres psql -U postgres -d fastloan_db"
echo "================================================"

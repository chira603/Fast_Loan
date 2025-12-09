#!/bin/bash

# FAST LOAN - Setup and Run Script
# This script will guide you through setting up and running the application

set -e

echo "========================================"
echo "   FAST LOAN - Setup & Run Guide"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo "Step 1: Checking Prerequisites..."
echo "-----------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v18+ from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed${NC}"
    echo ""
    echo "PostgreSQL Installation Instructions:"
    echo "-------------------------------------"
    echo "macOS:     brew install postgresql@15"
    echo "           brew services start postgresql@15"
    echo ""
    echo "Ubuntu:    sudo apt update"
    echo "           sudo apt install postgresql postgresql-contrib"
    echo "           sudo systemctl start postgresql"
    echo ""
    echo "Windows:   Download from https://www.postgresql.org/download/windows/"
    echo ""
    echo -e "${YELLOW}Please install PostgreSQL and run this script again.${NC}"
    echo ""
    echo "OR use Docker:"
    echo "docker run --name fastloan-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15"
    exit 1
else
    PSQL_VERSION=$(psql --version)
    echo -e "${GREEN}✓ PostgreSQL installed: $PSQL_VERSION${NC}"
fi

echo ""

# Step 2: Database Setup
echo "Step 2: Database Setup"
echo "-----------------------------------"
read -p "Do you want to set up the database now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter PostgreSQL username (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    echo "Creating database..."
    psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS fastloan_db;" 2>/dev/null || true
    psql -U "$DB_USER" -c "CREATE DATABASE fastloan_db;"
    
    echo "Running schema..."
    psql -U "$DB_USER" -d fastloan_db -f database/schema.sql
    
    read -p "Do you want to load sample data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Loading sample data..."
        psql -U "$DB_USER" -d fastloan_db -f database/seeds.sql
        echo -e "${GREEN}✓ Sample data loaded${NC}"
        echo ""
        echo "Test Credentials:"
        echo "  Admin:  admin@fastloan.com / password123"
        echo "  Client: john.doe@email.com / password123"
    fi
    
    echo -e "${GREEN}✓ Database setup complete${NC}"
fi

echo ""

# Step 3: Backend Setup
echo "Step 3: Backend Setup"
echo "-----------------------------------"
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
    read -p "Press Enter to continue after editing .env..."
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

cd ..

echo ""

# Step 4: Frontend Setup
echo "Step 4: Frontend Setup"
echo "-----------------------------------"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo ""

# Step 5: Ready to Run
echo "========================================"
echo "   Setup Complete! 🎉"
echo "========================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo "   → Backend will run on http://localhost:5000"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   npm run dev"
echo "   → Frontend will run on http://localhost:3000"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "Default Login Credentials:"
echo "  Admin:  admin@fastloan.com / password123"
echo "  Client: john.doe@email.com / password123"
echo ""
echo "========================================"

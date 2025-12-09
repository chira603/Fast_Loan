#!/bin/bash

echo "================================================"
echo "  FAST LOAN - Installation Check & Guide"
echo "================================================"
echo ""

# Check Node.js
echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo ""

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✓ PostgreSQL: $(psql --version)"
    echo ""
    echo "✅ All prerequisites are installed!"
    echo ""
    echo "Next steps:"
    echo "1. Setup database (see DATABASE_SETUP.md)"
    echo "2. Install dependencies"
    echo "3. Run the application"
else
    echo "❌ PostgreSQL: NOT INSTALLED"
    echo ""
    echo "⚠️  You need to install PostgreSQL first!"
    echo ""
    echo "Installation commands by OS:"
    echo ""
    echo "macOS:"
    echo "  brew install postgresql@15"
    echo "  brew services start postgresql@15"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Arch Linux:"
    echo "  sudo pacman -S postgresql"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Docker (any OS):"
    echo "  docker run --name fastloan-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15"
    echo ""
    echo "After installing PostgreSQL, run this script again."
fi

echo ""
echo "================================================"
echo "For detailed instructions, see: HOW_TO_RUN.md"
echo "================================================"

# 🚀 HOW TO RUN FAST LOAN APPLICATION

## ⚡ Quick Start (Choose One Method)

### Method 1: Automated Setup (Recommended)
```bash
chmod +x setup.sh
./setup.sh
```

### Method 2: Manual Setup (Step by Step)
Follow the guide below ⬇️

---

## 📋 Prerequisites Installation

### 1️⃣ Install PostgreSQL

**You MUST install PostgreSQL first. Choose your OS:**

#### **macOS**
```bash
# Install using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

#### **Ubuntu/Debian Linux**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Verify installation
psql --version
```

#### **Windows**
1. Download installer from: https://www.postgresql.org/download/windows/
2. Run installer and follow wizard
3. Remember the password you set for 'postgres' user
4. Add PostgreSQL to PATH

#### **Docker (Alternative - Any OS)**
```bash
# Pull and run PostgreSQL in Docker
docker run --name fastloan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fastloan_db \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

---

## 🗄️ Database Setup

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, run:
CREATE DATABASE fastloan_db;

# Exit psql
\q
```

### Step 2: Run Migrations

```bash
# Navigate to project root
cd /home/chirag/fastLoan

# Run schema (creates all tables)
psql -U postgres -d fastloan_db -f database/schema.sql

# Load sample data (optional but recommended for testing)
psql -U postgres -d fastloan_db -f database/seeds.sql
```

**✅ Expected Output:**
```
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
INSERT 0 5
```

### Step 3: Verify Database

```bash
# Check tables were created
psql -U postgres -d fastloan_db -c "\dt"

# Check sample users
psql -U postgres -d fastloan_db -c "SELECT username, email, role FROM users;"
```

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install all npm packages
npm install
```

### Step 2: Configure Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env file with your settings
nano .env
# OR
code .env
# OR
vim .env
```

**Minimum required configuration in `.env`:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastloan_db
DB_USER=postgres
DB_PASSWORD=postgres          # ← Change this to your PostgreSQL password

# JWT Secret (change to random string)
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start Backend Server

```bash
# From backend directory
npm run dev
```

**✅ You should see:**
```
✅ Database connected successfully
🚀 Server running on port 5000
📊 Environment: development
🔗 API Base URL: http://localhost:5000/api/v1
```

**Test the backend:**
```bash
# Open new terminal
curl http://localhost:5000/health
```

Should return: `{"status":"OK","message":"FAST LOAN API is running"}`

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
# Navigate to project root (open NEW terminal)
cd /home/chirag/fastLoan

# Install all npm packages
npm install
```

### Step 2: Start Development Server

```bash
# From project root
npm run dev
```

**✅ You should see:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 🌐 Access the Application

### Open your browser and navigate to:
```
http://localhost:3000
```

### Test Credentials (from sample data):

**Admin Account:**
- Email: `admin@fastloan.com`
- Password: `password123`

**Client Account:**
- Email: `john.doe@email.com`
- Password: `password123`

---

## 🎯 What You Can Test

1. **Homepage**
   - Try the EMI Calculator
   - Adjust loan amount and tenure
   - See real-time calculations

2. **Register/Login**
   - Create a new account
   - Login with test credentials

3. **Dashboard**
   - View your profile
   - See loan statistics

4. **Apply for Loan**
   - Fill out loan application
   - Submit and track status

5. **CIBIL Score Check**
   - Check credit score
   - View analysis and recommendations

6. **Admin Panel** (login as admin)
   - Approve/reject loans
   - Manage users
   - View analytics

---

## 🔍 Troubleshooting

### Database Connection Error
```bash
# Error: "connection refused" or "password authentication failed"

# Solution 1: Check PostgreSQL is running
sudo systemctl status postgresql    # Linux
brew services list                  # macOS

# Solution 2: Verify credentials in backend/.env
# Make sure DB_PASSWORD matches your PostgreSQL password

# Solution 3: Test connection manually
psql -U postgres -d fastloan_db -c "SELECT 1;"
```

### Port Already in Use
```bash
# Error: "Port 5000 is already in use"

# Solution: Kill the process or change port
# Kill process on port 5000:
lsof -ti:5000 | xargs kill -9

# OR change port in backend/.env:
PORT=5001
```

### Module Not Found
```bash
# Error: "Cannot find module 'express'" or similar

# Solution: Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# For frontend:
cd ..
rm -rf node_modules package-lock.json
npm install
```

### Database Tables Don't Exist
```bash
# Error: "relation 'users' does not exist"

# Solution: Run migrations again
psql -U postgres -d fastloan_db -f database/schema.sql
```

---

## 📱 Running in Production

### Build Frontend
```bash
npm run build
```

### Start Backend in Production
```bash
cd backend
NODE_ENV=production npm start
```

---

## 🛑 Stopping the Application

```bash
# Press Ctrl+C in both terminal windows (frontend and backend)

# To stop PostgreSQL:
sudo systemctl stop postgresql      # Linux
brew services stop postgresql@15    # macOS
docker stop fastloan-postgres       # Docker
```

---

## 📊 Quick Command Reference

### Database Commands
```bash
# Connect to database
psql -U postgres -d fastloan_db

# List tables
\dt

# View users
SELECT * FROM users;

# View loans
SELECT * FROM loans;

# Exit psql
\q
```

### Development Commands
```bash
# Backend (from backend folder)
npm run dev          # Start development server
npm start            # Start production server

# Frontend (from root)
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🎨 Next Steps

1. ✅ Explore the EMI calculator
2. ✅ Register a new account
3. ✅ Apply for a test loan
4. ✅ Login as admin to approve it
5. ✅ Check CIBIL score
6. ✅ Customize the UI (colors, logo)
7. ✅ Add real payment gateway
8. ✅ Deploy to production

---

## 📞 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Check logs:
  - Backend: Terminal where backend is running
  - Frontend: Browser console (F12)
  - Database: PostgreSQL logs

---

**Enjoy using FAST LOAN! 🚀💰**

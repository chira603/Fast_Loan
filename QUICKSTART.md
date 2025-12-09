# FAST LOAN - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] PostgreSQL v12+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Step 1: Database Setup (2 minutes)

```bash
# Start PostgreSQL (if not running)
# On macOS/Linux:
sudo service postgresql start
# On Windows: Start PostgreSQL service from Services

# Create database
psql -U postgres -c "CREATE DATABASE fastloan_db;"

# Run schema
cd database
psql -U postgres -d fastloan_db -f schema.sql

# Load sample data (optional)
psql -U postgres -d fastloan_db -f seeds.sql
```

### Step 2: Backend Setup (1 minute)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (minimum required):
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=any_random_secret_string

# Start server
npm run dev
```

✅ Backend running at: http://localhost:5000

### Step 3: Frontend Setup (1 minute)

```bash
# Open new terminal, navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:3000

### Step 4: Test the Application (1 minute)

1. **Open browser**: http://localhost:3000
2. **Register a new account** or use sample credentials:
   - Email: `john.doe@email.com`
   - Password: `password123`
3. **Explore features**:
   - Try EMI calculator on homepage
   - Apply for a loan
   - Check CIBIL score
   - View dashboard

### Admin Access

Use these credentials (from seeds.sql):
- Email: `admin@fastloan.com`
- Password: `password123`

Access admin panel at: http://localhost:3000/admin

---

## Common Issues & Solutions

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Check credentials in backend/.env
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_NAME=fastloan_db
```

### Port Already in Use
```bash
# Backend (Port 5000)
# Change PORT in backend/.env

# Frontend (Port 3000)
# Vite will automatically use next available port
```

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Commands Reference

### Development
```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
npm run dev

# View backend logs
cd backend && tail -f logs/app.log
```

### Database
```bash
# Reset database
psql -U postgres -d fastloan_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d fastloan_db -f database/schema.sql

# Backup database
pg_dump -U postgres fastloan_db > backup.sql

# Restore database
psql -U postgres -d fastloan_db < backup.sql
```

### Testing
```bash
# Test backend API
curl http://localhost:5000/health

# Test database connection
psql -U postgres -d fastloan_db -c "SELECT COUNT(*) FROM users;"
```

---

## Next Steps

1. **Customize**: Update colors, logo, and branding
2. **Extend**: Add more features from the documentation
3. **Deploy**: Follow deployment guide in README.md
4. **Integrate**: Connect real payment gateway and CIBIL API

---

## Need Help?

- 📖 Read full documentation: [README.md](README.md)
- 🔧 API Reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- 🐛 Report issues: GitHub Issues
- 💬 Contact: support@fastloan.com

**Happy Coding! 🎉**

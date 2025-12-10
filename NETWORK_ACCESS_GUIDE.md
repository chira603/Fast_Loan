# 🌐 Network Access Setup Guide - Fast Loan

## 📋 Overview

This guide will help you run Fast Loan on your network so your friend can access it from another PC.

---

## 🏠 Your Network Information

- **Your Local IP**: `10.212.189.193`
- **Backend Port**: `5000`
- **Frontend Port**: `3000`

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Enable PostgreSQL Network Access**

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/16/main/postgresql.conf

# Find this line and change it to:
listen_addresses = '*'

# Edit pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Add this line at the end:
host    fastloan_db     chirag          10.212.0.0/16           md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **Step 2: Allow Firewall Access**

```bash
# Allow backend port
sudo ufw allow 5000/tcp

# Allow frontend port
sudo ufw allow 3000/tcp

# Allow PostgreSQL (if friend needs direct DB access)
sudo ufw allow 5433/tcp

# Check status
sudo ufw status
```

### **Step 3: Start Backend (Network Mode)**

```bash
cd /home/chirag/Fast_Loan/backend
npm start
```

The backend will now listen on `0.0.0.0:5000` (all network interfaces)

### **Step 4: Start Frontend (Network Mode)**

**Option A: Use Network Environment Variables**
```bash
cd /home/chirag/Fast_Loan
cp .env.network .env
npm run dev
```

**Option B: Override on Command Line**
```bash
cd /home/chirag/Fast_Loan
VITE_API_BASE_URL=http://10.212.189.193:5000/api/v1 npm run dev
```

---

## 📱 Share These URLs with Your Friend

### **Access URLs:**

1. **Frontend (Main App)**
   ```
   http://10.212.189.193:3000
   ```

2. **Backend API**
   ```
   http://10.212.189.193:5000/api/v1
   ```

3. **Health Check**
   ```
   http://10.212.189.193:5000/health
   ```

### **Login Credentials:**

**Admin Account:**
- Email: `admin@fastloan.com`
- Password: `password123`

**Test Client Accounts:**
- Email: `john.doe@email.com`
- Password: `password123`

---

## 🔥 Simplified One-Command Setup

Create a startup script:

```bash
# Create network-start.sh
cat > network-start.sh << 'EOF'
#!/bin/bash

echo "🌐 Starting Fast Loan in Network Mode..."
echo "📍 Your IP: 10.212.189.193"

# Start backend in background
echo "🔧 Starting Backend..."
cd /home/chirag/Fast_Loan/backend
npm start &
BACKEND_PID=$!

sleep 5

# Start frontend with network config
echo "🎨 Starting Frontend..."
cd /home/chirag/Fast_Loan
cp .env.network .env
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services Started!"
echo "📱 Share this URL with your friend:"
echo "   http://10.212.189.193:3000"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin: admin@fastloan.com / password123"
echo "   Client: john.doe@email.com / password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait and handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
EOF

chmod +x network-start.sh
```

**Then just run:**
```bash
./network-start.sh
```

---

## 🐳 Alternative: Docker Network Mode (Easiest)

If you have Docker running:

```bash
# Update docker-compose.yml
cd /home/chirag/Fast_Loan

# Start services
docker-compose up -d

# Services will be available at:
# - Frontend: http://10.212.189.193:3000
# - Backend: http://10.212.189.193:5000
```

---

## 🔍 Troubleshooting

### **Problem 1: Friend Can't Access**

```bash
# Test if ports are open
nc -zv 10.212.189.193 5000
nc -zv 10.212.189.193 3000

# Check firewall
sudo ufw status

# Verify server is listening on 0.0.0.0
netstat -tuln | grep -E '5000|3000'
```

### **Problem 2: CORS Errors**

Already fixed in `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.212.189.193:3000'],
  credentials: true
}));
```

### **Problem 3: API Calls Failing**

Friend should use: `http://10.212.189.193:3000` (not localhost)

The frontend will automatically proxy `/api` calls to backend.

---

## 🌍 Internet Access (Not Local Network)

If your friend is on a different network (not same WiFi), you need:

### **Option 1: ngrok (Easiest - Free)**

```bash
# Install ngrok
sudo snap install ngrok

# Expose backend
ngrok http 5000 &

# Expose frontend  
ngrok http 3000 &

# Share the https URLs provided by ngrok
```

### **Option 2: Cloudflare Tunnel (Free & Secure)**

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Create tunnel
cloudflared tunnel --url http://localhost:3000
```

### **Option 3: Deploy to Cloud**

- **Vercel** (Frontend) - Free
- **Railway/Render** (Backend) - Free tier
- **Neon/Supabase** (PostgreSQL) - Free tier

---

## 📊 Network Access Status

After setup, verify:

```bash
# Check what's listening
sudo netstat -tuln | grep -E '5000|3000|5433'

# Expected output:
# tcp 0.0.0.0:5000  - Backend
# tcp 0.0.0.0:3000  - Frontend
# tcp 0.0.0.0:5433  - PostgreSQL
```

---

## 🔐 Security Notes

⚠️ **For Development/Testing Only**

If using in production:
1. Change all default passwords
2. Use HTTPS (Let's Encrypt)
3. Set up proper firewall rules
4. Use environment variables for secrets
5. Enable rate limiting
6. Add IP whitelisting

---

## 💡 What I Already Changed

✅ Backend listens on `0.0.0.0:5000` (all interfaces)  
✅ Frontend listens on `0.0.0.0:3000` (all interfaces)  
✅ CORS configured for your IP  
✅ Created `.env.network` with your IP  
✅ Admin password fixed to `password123`  

---

## 🎯 Quick Test

**On your PC:**
```bash
curl http://10.212.189.193:5000/health
```

**Your friend should access:**
```
http://10.212.189.193:3000
```

---

## 📞 Common Questions

**Q: Do I need to keep my PC on?**  
A: Yes, your PC must be running and connected to the network.

**Q: Will it work if friend is on different WiFi?**  
A: No. Use ngrok or deploy to cloud for internet access.

**Q: What if my IP changes?**  
A: Update `.env.network` with new IP and restart services.

**Q: Can multiple friends access simultaneously?**  
A: Yes! The app supports multiple concurrent users.

---

## 🚦 Next Steps

1. **Enable PostgreSQL network access** (Step 1)
2. **Allow firewall ports** (Step 2)
3. **Start backend** (Step 3)
4. **Start frontend** (Step 4)
5. **Share URL with friend**: `http://10.212.189.193:3000`
6. **Share credentials**: `admin@fastloan.com / password123`

---

**Ready to go!** 🎉

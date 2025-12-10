# 🚀 Quick Network Access - Fast Loan

## ⚡ Super Quick Start (2 Steps)

### **Step 1: Enable Firewall (One-time)**
```bash
sudo ufw allow 5000/tcp
sudo ufw allow 3000/tcp
```

### **Step 2: Start Services**
```bash
cd /home/chirag/Fast_Loan
./network-start.sh
```

---

## 📱 Share with Your Friend

**URL to Access:**
```
http://10.212.189.193:3000
```

**Login Credentials:**
```
Admin:  admin@fastloan.com / password123
Client: john.doe@email.com / password123
```

---

## 🛑 Stop Services

Press `Ctrl+C` in the terminal where you ran `./network-start.sh`

---

## 📝 What Changed?

✅ Backend now listens on all network interfaces (0.0.0.0)  
✅ Frontend accessible from network  
✅ CORS enabled for your IP  
✅ All passwords work with `password123`  

---

## 🔍 Troubleshooting

**Friend can't access?**
```bash
# 1. Check firewall
sudo ufw status

# 2. Verify services are running
curl http://10.212.189.193:5000/health
curl http://10.212.189.193:3000

# 3. Check if ports are listening
netstat -tuln | grep -E '5000|3000'
```

**Need to access from Internet (not just local WiFi)?**

Use ngrok:
```bash
sudo snap install ngrok
ngrok http 3000
# Share the https URL provided
```

---

## 📖 Full Documentation

See `NETWORK_ACCESS_GUIDE.md` for complete instructions.

---

## ⚠️ Important Notes

- Both PCs must be on **same WiFi network**
- Your PC must stay **ON** and **connected**
- If your IP changes, update `.env.network` and restart

---

**Your IP**: `10.212.189.193`  
**Frontend**: Port `3000`  
**Backend**: Port `5000`  

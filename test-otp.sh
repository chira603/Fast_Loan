#!/bin/bash

echo "Testing OTP API Endpoints..."
echo ""

# Test Email OTP
echo "1. Testing Email OTP Send..."
curl -X POST http://localhost:5000/api/v1/otp/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Test User"
  }'

echo ""
echo ""

# Test SMS OTP
echo "2. Testing SMS OTP Send..."
curl -X POST http://localhost:5000/api/v1/otp/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9313692958"
  }'

echo ""
echo ""
echo "Check the backend terminal for OTP codes!"

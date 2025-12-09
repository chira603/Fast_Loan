# FAST LOAN API Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.fastloan.com/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "full_name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "client",
      "full_name": "John Doe",
      "kyc_verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "client",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "kyc_verified": false
  }
}
```

---

### Loans

#### Create Loan Application
```http
POST /loans
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "amount": 3000,
  "tenure_months": 12,
  "interest_rate": 12,
  "emi": 266.07,
  "purpose": "Home Renovation",
  "employment_status": "Employed",
  "monthly_income": 5000,
  "cibil_score": 720,
  "repayment_schedule": [
    {
      "month": 1,
      "due_date": "2026-01-07",
      "amount": 266.07,
      "principal": 236.07,
      "interest": 30.00,
      "status": "pending"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Loan application submitted successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "amount": "3000.00",
    "tenure_months": 12,
    "interest_rate": "12.00",
    "emi": "266.07",
    "status": "pending",
    "application_date": "2025-12-07T10:00:00.000Z"
  }
}
```

#### Get All Loans
```http
GET /loans?status=pending&limit=10&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by loan status (pending, approved, rejected, disbursed, repaid)
- `limit` (optional): Number of results to return
- `offset` (optional): Offset for pagination

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "amount": "3000.00",
      "tenure_months": 12,
      "status": "pending",
      "application_date": "2025-12-07T10:00:00.000Z"
    }
  ]
}
```

#### Get Single Loan
```http
GET /loans/:id
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "amount": "3000.00",
    "tenure_months": 12,
    "interest_rate": "12.00",
    "emi": "266.07",
    "status": "pending",
    "repayment_schedule": [...]
  }
}
```

#### Update Loan Status (Admin Only)
```http
PUT /loans/:id/status
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Application approved after verification"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Loan status updated successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "approval_date": "2025-12-07T11:00:00.000Z"
  }
}
```

#### Get Loan Statistics
```http
GET /loans/user/stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_loans": "5",
    "pending_loans": "1",
    "approved_loans": "2",
    "disbursed_loans": "1",
    "repaid_loans": "1",
    "total_amount": "15000.00",
    "average_amount": "3000.00"
  }
}
```

---

### Payments

#### Create Payment
```http
POST /payments
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "loan_id": 1,
  "amount": 266.07,
  "transaction_id": "TXN123456789",
  "payment_method": "Credit Card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "id": 1,
    "loan_id": 1,
    "amount": "266.07",
    "status": "success",
    "payment_date": "2025-12-07T12:00:00.000Z",
    "transaction_id": "TXN123456789"
  }
}
```

#### Get Payments for Loan
```http
GET /payments/loan/:loanId
Authorization: Bearer {token}
```

#### Get User Payments
```http
GET /payments/user
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "loan_id": 1,
      "amount": "266.07",
      "payment_date": "2025-12-07T12:00:00.000Z",
      "status": "success",
      "transaction_id": "TXN123456789"
    }
  ]
}
```

---

### Credit Score

#### Perform CIBIL Check
```http
POST /credit/check
Authorization: Bearer {token}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Credit score check completed",
  "data": {
    "id": 1,
    "user_id": 1,
    "score": 720,
    "report_details": {
      "factors": [
        {
          "name": "Payment History",
          "impact": "positive",
          "score": 85
        },
        {
          "name": "Credit Utilization",
          "impact": "neutral",
          "score": 70
        }
      ],
      "analysis": "Good credit score. Responsible payment history.",
      "recommendations": ["Make all payments on time"],
      "rating": "Good"
    },
    "checked_at": "2025-12-07T13:00:00.000Z"
  }
}
```

#### Get Latest Credit Score
```http
GET /credit/latest
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "score": 720,
    "report_details": {...},
    "checked_at": "2025-12-07T13:00:00.000Z"
  }
}
```

#### Get Credit History
```http
GET /credit/history
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 3,
      "score": 720,
      "checked_at": "2025-12-07T13:00:00.000Z"
    },
    {
      "id": 2,
      "score": 710,
      "checked_at": "2025-11-07T13:00:00.000Z"
    }
  ]
}
```

---

### Contact

#### Submit Contact Form
```http
POST /contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question about loan applications."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully. We will get back to you soon!",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I have a question about loan applications.",
    "submitted_at": "2025-12-07T14:00:00.000Z"
  }
}
```

#### Get All Contacts (Admin Only)
```http
GET /contact?resolved=false&limit=10
Authorization: Bearer {admin_token}
```

#### Mark Contact as Resolved (Admin Only)
```http
PUT /contact/:id/resolve
Authorization: Bearer {admin_token}
```

---

### Users (Admin Only)

#### Get All Users
```http
GET /users?role=client&kyc_verified=true&limit=10
Authorization: Bearer {admin_token}
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer {admin_token}
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "kyc_verified": true
}
```

#### Verify User KYC
```http
PUT /users/:id/verify
Authorization: Bearer {admin_token}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role 'client' is not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Loan not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response on Limit**:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

## CORS

The API allows requests from:
- Development: `http://localhost:3000`
- Production: Configure `FRONTEND_URL` in `.env`

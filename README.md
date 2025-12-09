# FAST LOAN - Personal Loan Application Platform

![FAST LOAN](https://img.shields.io/badge/FAST-LOAN-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**FAST LOAN** is a professional, full-stack web application for providing small personal loans up to $5,000. Built with React, Node.js/Express, and PostgreSQL, it offers a complete loan management system with features like EMI calculation, CIBIL score checking, user authentication, and admin oversight.

## 🌟 Features

### User Features
- **User Authentication**: Secure login/register with JWT tokens
- **EMI Calculator**: Interactive calculator with visualizations
- **Loan Application**: Multi-step loan application process
- **CIBIL Score Check**: Credit score checking with detailed analysis
- **Dashboard**: View loans, payments, and status
- **Contact Form**: Customer support integration
- **Profile Management**: Update personal information

### Admin Features
- **User Management**: View and verify users
- **Loan Approval**: Approve/reject loan applications
- **Analytics**: Loan statistics and reports
- **Contact Management**: Handle customer inquiries

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Real-time Validation**: Form validation with Yup
- **State Management**: Redux Toolkit
- **API Integration**: RESTful API with Axios
- **Security**: bcrypt password hashing, JWT authentication
- **Database**: PostgreSQL with proper indexing
- **Charts**: Interactive visualizations with Chart.js

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/FastLoan.git
cd FastLoan
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fastloan_db;

# Exit psql
\q
```

#### Run Migrations

```bash
# Navigate to database folder
cd database

# Run schema
psql -U postgres -d fastloan_db -f schema.sql

# Seed data (optional, for development)
psql -U postgres -d fastloan_db -f seeds.sql
```

**Default Admin Credentials (from seeds):**
- Email: `admin@fastloan.com`
- Password: `password123`

### 3. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Important .env Variables:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastloan_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_super_secret_jwt_key_change_this
FRONTEND_URL=http://localhost:3000
```

```bash
# Start backend server
npm run dev

# Backend will run on http://localhost:5000
```

### 4. Frontend Setup

```bash
# Navigate to root/frontend folder
cd ..

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will run on http://localhost:3000
```

## 🏗️ Project Structure

```
FastLoan/
├── backend/                    # Node.js/Express Backend
│   ├── config/                # Database configuration
│   ├── models/                # Database models
│   ├── routes/                # API routes
│   ├── middleware/            # Auth & validation middleware
│   ├── server.js             # Express server entry
│   └── package.json
│
├── database/                  # PostgreSQL scripts
│   ├── schema.sql            # Database schema
│   └── seeds.sql             # Sample data
│
├── src/                       # React Frontend
│   ├── components/           # Reusable components
│   │   ├── common/          # Header, Footer, Loading
│   │   ├── auth/            # Login, Register forms
│   │   ├── dashboard/       # Dashboard components
│   │   ├── loan/            # Loan-related components
│   │   └── credit/          # CIBIL check components
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── ...
│   ├── services/            # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── loanService.js
│   │   └── creditService.js
│   ├── store/               # Redux store
│   │   ├── slices/
│   │   └── store.js
│   ├── utils/               # Utility functions
│   │   ├── emiCalculator.js
│   │   └── validators.js
│   ├── styles/              # CSS files
│   ├── App.jsx              # Root component
│   └── index.jsx            # Entry point
│
├── public/                   # Static assets
├── .env                      # Environment variables
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastloan_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=FAST LOAN
VITE_MAX_LOAN_AMOUNT=5000
VITE_MIN_LOAN_AMOUNT=100
VITE_DEFAULT_INTEREST_RATE=12
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Loan Endpoints (Protected)

#### Create Loan Application
```http
POST /loans
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 3000,
  "tenure_months": 12,
  "interest_rate": 12,
  "emi": 266.07,
  "purpose": "Home Renovation",
  "employment_status": "Employed",
  "monthly_income": 5000
}
```

#### Get All Loans
```http
GET /loans?status=pending&limit=10
Authorization: Bearer {token}
```

### Credit Check Endpoints

#### Perform CIBIL Check
```http
POST /credit/check
Authorization: Bearer {token}
```

#### Get Latest Score
```http
GET /credit/latest
Authorization: Bearer {token}
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ..
npm test
```

### Sample Test Users

After running seeds.sql:
- **Admin**: admin@fastloan.com / password123
- **Client 1**: john.doe@email.com / password123
- **Client 2**: jane.doe@email.com / password123

## 🎨 UI/UX Design

### Color Scheme
- **Primary**: #007BFF (Trust Blue)
- **Secondary**: #28A745 (Success Green)
- **Danger**: #dc3545 (Error Red)
- **Neutral**: #f8f9fa (Light Gray)

### Typography
- **Font Family**: Inter, Roboto
- **Headings**: Bold, large
- **Body**: Regular, readable

### Components
- Responsive cards
- Interactive charts (Chart.js)
- Toast notifications
- Loading spinners
- Form validation

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Authentication**: Secure token-based auth
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 100 requests per 15 minutes
- **Helmet.js**: Security headers

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Hamburger menu for mobile
- Touch-friendly buttons
- Responsive grids
- Optimized for all screen sizes

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

### Backend (Heroku/Railway)

```bash
# Add Procfile
echo "web: node server.js" > Procfile

# Deploy to Heroku
heroku create fastloan-api
git push heroku main

# Set environment variables
heroku config:set JWT_SECRET=your_secret
```

### Database (AWS RDS/Heroku Postgres)

```bash
# Heroku Postgres
heroku addons:create heroku-postgresql:hobby-dev
heroku pg:psql < database/schema.sql
```

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start with nodemon
npm test           # Run tests
```

## 📊 Database Schema

### Main Tables
- **users**: User accounts (clients & admins)
- **loans**: Loan applications and details
- **payments**: Payment transactions
- **credit_checks**: CIBIL score records
- **contacts**: Contact form submissions
- **notifications**: User notifications
- **audit_logs**: Security audit trail

See `database/schema.sql` for complete schema.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **FAST LOAN Team** - *Initial work*

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Express.js for the backend framework
- PostgreSQL for the robust database
- Chart.js for beautiful visualizations
- Tailwind CSS for utility-first styling
- All open-source contributors

## 📞 Support

For support, email support@fastloan.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] React Native mobile app
- [ ] Real-time notifications with WebSockets
- [ ] Integration with actual payment gateways (Stripe/Razorpay)
- [ ] Real CIBIL API integration
- [ ] Document upload for KYC
- [ ] Email/SMS notifications
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Loan restructuring options
- [ ] Referral system

---

**Built with ❤️ for secure and accessible lending**

# BitMine Backend - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` File
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
```

### 3. Run Backend
```bash
npm run dev
```

Backend will start at `http://localhost:5000`

### 4. Test API
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "BitMine Backend is running"
}
```

---

## 🔗 Connect Frontend to Backend

Update your frontend API calls to use:
```javascript
const API_URL = 'http://localhost:5000/api';

// Example: Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## 📦 API Mock Data

The backend includes pre-populated mock data:

### Users
- Admin: `admin@bitmine.com` / `admin123`
- User: `user@bitmine.com` / `user123`

### Products
- 3 sample products with different categories and skill levels

### Authentication
JWT tokens are generated on login and valid for 7 days

---

## 🛣️ Available Endpoints

Test these with curl or Postman:

```bash
# Health Check
curl http://localhost:5000/api/health

# Get Products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitmine.com","password":"admin123"}'

# Subscribe Newsletter
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

## 🗄️ Database Migration

To use a real database instead of mock data:

1. Install database package:
   ```bash
   npm install pg  # for PostgreSQL
   ```

2. Update routes to query database instead of in-memory arrays

3. Create database tables using provided SQL schema

---

## 🔐 Environment Variables

Required variables in `.env`:

```
PORT                 = Server port (default: 5000)
NODE_ENV            = development/production
JWT_SECRET          = Secret key for JWT tokens
JWT_EXPIRE          = Token expiration (e.g., 7d)
FRONTEND_URL        = Frontend origin for CORS
DB_HOST             = Database host
DB_USER             = Database user
DB_PASSWORD         = Database password
DB_NAME             = Database name
SMTP_HOST           = Email service host
PAYSTACK_SECRET_KEY = Paystack API key
```

---

## 📚 Documentation

Full API documentation is available in `README.md`

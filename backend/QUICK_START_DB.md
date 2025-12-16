# 🗄️ Database Quick Start - BitMine Backend

## 🚀 Fastest Way to Get Started (PostgreSQL)

### macOS (Homebrew)

```bash
# 1. Install PostgreSQL
brew install postgresql@15

# 2. Start PostgreSQL service
brew services start postgresql@15

# 3. Connect to PostgreSQL
psql -U postgres

# 4. Copy and paste this entire block:
CREATE DATABASE bitmine_db;
CREATE USER bitmine_user WITH PASSWORD 'bitmine123';
ALTER ROLE bitmine_user SET client_encoding TO 'utf8';
ALTER ROLE bitmine_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bitmine_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bitmine_db TO bitmine_user;
\q

# 5. Create tables (in backend directory)
psql -U bitmine_user -d bitmine_db -f src/database/schema.sql
```

### 6. Update .env file

Create `.env` in backend folder:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bitmine_db
DB_USER=bitmine_user
DB_PASSWORD=bitmine123

JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5175
```

### 7. Install database packages

```bash
cd backend
npm install pg bcryptjs
```

### 8. Start backend

```bash
npm run dev
```

---

## 🟢 Cloud Database (Easiest - No Local Setup)

### MongoDB Atlas (Free Tier Available)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/bitmine_db`

Update `.env`:
```env
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bitmine_db
```

Install package:
```bash
npm install mongoose bcryptjs
```

---

## ✅ Verify Database Connection

After setting up, test with:

```bash
# 1. Start backend
npm run dev

# 2. You should see:
# ✅ Connected to PostgreSQL database
# 🚀 BitMine Backend running on http://localhost:5000

# 3. Test with curl
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"BitMine Backend is running"}
```

---

## 📊 Database Comparison

| Feature | PostgreSQL | MongoDB Atlas |
|---------|-----------|---------------|
| Setup Time | 10-15 min | 5 min |
| Cost | Free | Free tier + paid |
| Best For | Production | Development/Cloud |
| Connection | Local | Cloud |

**Recommendation:** Use **PostgreSQL locally** for development, **MongoDB Atlas** for cloud deployment.

---

## 🔧 Next: Connect Frontend to Backend

Update your frontend API URLs:

```javascript
// In your frontend code
const API_URL = 'http://localhost:5000/api';

// Example: Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## ❌ Common Issues & Solutions

### "Database connection refused"
- Ensure PostgreSQL is running: `brew services list`
- Check credentials in `.env` match what you created

### "Port 5432 already in use"
```bash
lsof -i :5432
kill -9 <PID>
```

### "User authentication failed"
- Verify database user password in `.env`
- Recreate user with correct password

---

## 📚 Full Guide

For complete setup with all options, see `DATABASE_SETUP.md`

---

## Support

Having issues? Run these diagnostics:

```bash
# Check PostgreSQL status
psql -U bitmine_user -d bitmine_db -c "SELECT NOW();"

# Check MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/bitmine_db"
```

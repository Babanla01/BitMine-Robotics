# Environment Configuration Guide

## Overview
Your `.env` file now supports both **LOCAL DEVELOPMENT** and **LIVE/PRODUCTION** configurations. You can easily switch between them by uncommenting/commenting the sections.

## Current Setup

### 🟢 LOCAL DEVELOPMENT (Active)
The **LOCAL DEVELOPMENT** section is currently active. Use this when:
- Developing features locally
- Testing new functionality
- Running the project on your machine
- Database is running on `localhost:5432`
- Using test Paystack keys

**Local Database Setup:**
```bash
DB_NAME=bitmine_local
DB_USER=postgres
DB_PASSWORD=postgres
```

### 🔴 LIVE/PRODUCTION (Commented Out)
The **LIVE/PRODUCTION** section is commented out. To use it:
- Uncomment all lines in the "LIVE/PRODUCTION CONFIGURATION" section
- Comment out all lines in the "LOCAL DEVELOPMENT CONFIGURATION" section
- Use your actual production credentials

## How to Switch Environments

### Switch to LIVE/PRODUCTION
1. Open `backend/.env`
2. Comment out the LOCAL DEVELOPMENT section (add `#` at start of each line)
3. Uncomment the LIVE/PRODUCTION section (remove `#` from start of each line)
4. Restart your backend server

Example:
```dotenv
# LOCAL - commented out
# PORT=5001
# DB_TYPE=postgresql
# ...

# LIVE - uncommented
PORT=5001
DB_TYPE=postgresql
# ...
```

### Switch back to LOCAL DEVELOPMENT
1. Open `backend/.env`
2. Uncomment the LOCAL DEVELOPMENT section
3. Comment out the LIVE/PRODUCTION section
4. Restart your backend server

## Database Setup for Local Development

### PostgreSQL Setup (macOS with Homebrew)

**Install PostgreSQL:**
```bash
brew install postgresql
```

**Start PostgreSQL:**
```bash
brew services start postgresql
```

**Create Local Database:**
```bash
psql -U postgres
```

Then in psql:
```sql
CREATE DATABASE bitmine_local;
\q
```

**Verify Connection:**
```bash
psql -U postgres -d bitmine_local
```

### SQLite Alternative (Simpler)

If you want to avoid setting up PostgreSQL, you can modify the local config to use SQLite:

```dotenv
DB_TYPE=sqlite
DB_PATH=./bitmine_local.db
```

Then update your database connection code to support SQLite.

## Environment Variables Explained

| Variable | Purpose | Local | Live |
|----------|---------|-------|------|
| `PORT` | Backend server port | 5001 | 5001 |
| `DB_TYPE` | Database type | postgresql | postgresql |
| `DB_HOST` | Database host | localhost | production-host |
| `DB_NAME` | Database name | bitmine_local | bitmine |
| `DB_USER` | Database user | postgres | bitminerobotics |
| `JWT_SECRET` | Token signing key | dev key | production key |
| `NODE_ENV` | Environment | development | production |
| `EMAIL_USER` | Email for notifications | test email | production email |
| `PAYSTACK_SECRET_KEY` | Payment service key | test key | live key |

## Important Notes

⚠️ **Security:**
- Never commit live credentials to Git
- Use `.gitignore` to prevent `.env` from being committed (if not already)
- Change JWT_SECRET in live environment
- Use strong passwords for production database

⚠️ **Local Testing:**
- Use test Paystack keys for local development
- Use a test Gmail account for local email testing
- Don't use real customer data in local development

## Troubleshooting

**Connection Refused Error:**
- Ensure PostgreSQL is running: `brew services start postgresql`
- Check if port 5432 is available
- Verify DATABASE credentials in .env match your local setup

**Database User Doesn't Exist:**
- Create the user: `psql -U postgres -c "CREATE USER bitminerobotics WITH PASSWORD 'SuperStrongPass@123';"`
- Grant privileges: `psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE bitmine TO bitminerobotics;"`

**Email Configuration Issues:**
- Generate Gmail App Password: https://myaccount.google.com/apppasswords
- Use the 16-character password, not your regular Gmail password

## Quick Commands

```bash
# Start local backend
cd backend && npm start

# Check PostgreSQL status
brew services list

# Stop PostgreSQL
brew services stop postgresql

# Connect to local database
psql -U postgres -d bitmine_local
```

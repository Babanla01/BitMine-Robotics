# 🔒 Production Security Setup Guide - BitMine

**Status:** ✅ Phase 1 Complete (Environment Variables & Secrets)

---

## What We Fixed

### ✅ Completed Security Improvements

1. **JWT Secret Upgraded**
   - ❌ OLD: `bitmine_super_secret_key_change_in_production_2025` (weak, predictable)
   - ✅ NEW: `03620785060c67b431f8eff24d7cceb9d6e4a2277f0137764053897981c09158` (secure, 64 chars)

2. **Removed Hardcoded Fallbacks**
   - Removed `'mahammudabolaji@gmail.com'` fallback from email config
   - Removed `'secret_key'` fallback from JWT generation
   - Removed `'noreply@bitmine.com'` fallback from email sender
   - Removed `'your-app-password'` fallback from email password
   - **Result:** Now fails loudly if environment variables are missing instead of silently using weak defaults

3. **Added Environment Variable Validation**
   - Backend now checks for required environment variables at startup
   - If any critical variable is missing, the server refuses to start
   - Production mode enforces strong JWT secrets (32+ chars minimum)
   - Prevents accidental deployment with incomplete configuration

4. **Updated .gitignore**
   - Added explicit `.env` file exclusion
   - Added `.env.local` and `.env.*.local` patterns
   - Prevents accidental commits of sensitive data

5. **Created .env.example Files**
   - Safe templates for both frontend and backend
   - No real credentials in examples
   - Includes helpful comments and links for generating credentials

---

## 🚀 Deploying to Hostinger

### Step 1: Prepare Your Credentials (Local Only)

Generate a secure JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Set Environment Variables in Hostinger

1. **Log into Hostinger Control Panel**
2. **Navigate to:** Your Application → Settings → Environment Variables
3. **Add the following variables:**

#### Backend Environment Variables:

```
PORT=5001
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=your_hostinger_db_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_secure_db_password

# Generate a NEW secure secret for production
JWT_SECRET=<paste_your_generated_secure_secret_here>
JWT_EXPIRE=7d

# Update with your actual frontend URL
FRONTEND_URL=https://yourdomain.com

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Paystack Keys
PAYSTACK_SECRET_KEY=sk_live_your_actual_paystack_key
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_paystack_key
```

#### Frontend Environment Variables:

```
VITE_API_URL=https://api.yourdomain.com
```

### Step 3: Important Security Checklist Before Deployment

- [ ] **Generate a NEW JWT secret for production** (don't reuse development key)
- [ ] **Use HTTPS URLs only** (not http://)
- [ ] **Generate Gmail App Password** (not your regular password)
  - Go to: https://support.google.com/accounts/answer/185833
  - Use this generated password, NOT your Gmail password
- [ ] **Use Paystack LIVE keys** (not test keys)
  - Get from: https://dashboard.paystack.com/#/settings/developer
- [ ] **Set NODE_ENV to "production"** (enables production security checks)
- [ ] **.env file is in .gitignore** (verified ✅)
- [ ] **Database backups configured** in Hostinger
- [ ] **SSL/TLS certificate enabled** (HTTPS)

### Step 4: Verify Deployment

After deploying, test:

```bash
# Test backend is running
curl https://yourdomain.com/api/health

# Test frontend loads
curl https://yourdomain.com

# Check no errors in server logs
```

---

## 🔑 How to Generate Required Credentials

### Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Use this password in EMAIL_PASSWORD, **not your actual Gmail password**

### Paystack Keys
1. Go to https://dashboard.paystack.com/#/settings/developer
2. Switch to "Live" mode (not "Test")
3. Copy your Secret Key (starts with `sk_live_`)
4. Copy your Public Key (starts with `pk_live_`)

### Hostinger Database
1. In Hostinger control panel, create a new PostgreSQL database
2. Note the hostname, database name, username, and password
3. Use these in your environment variables

---

## 🛡️ Security Best Practices Going Forward

1. **Never commit `.env` files** - Always use environment variables in your hosting platform
2. **Rotate secrets regularly** - Change JWT secrets, API keys every 6-12 months
3. **Use unique credentials** - Don't reuse credentials across environments
4. **Monitor access logs** - Check Hostinger logs for suspicious activity
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Enable 2FA** - For Hostinger, Gmail, Paystack accounts

---

## 📋 Next Security Items (Phase 2)

After confirming production deployment works:

1. **Implement Password Complexity Requirements**
   - Enforce uppercase, lowercase, numbers, special characters
   - Minimum 12 characters

2. **Add Refresh Token Strategy**
   - Short-lived access tokens (15 minutes)
   - Longer-lived refresh tokens (7 days)
   - Automatic token rotation

3. **Implement Account Lockout**
   - Lock after 5 failed login attempts
   - 30-minute cooldown

4. **Add Rate Limiting**
   - Prevent brute force attacks
   - Already installed (`express-rate-limit`)

5. **Set Up Error Logging/Monitoring**
   - Use Sentry or similar service
   - Track production errors in real-time

---

## ✅ Validation Checklist

- [ ] JWT secret updated to 64-char secure string
- [ ] .env file is in .gitignore
- [ ] .env.example files created for templates
- [ ] Email configuration requires environment variables
- [ ] Server validates all required env vars at startup
- [ ] No hardcoded fallbacks in auth routes
- [ ] Ready to deploy to Hostinger

---

**Last Updated:** December 20, 2025  
**Status:** Phase 1 - Environment & Secrets ✅

# 🚀 Email System Setup Checklist

## Quick Start (5 minutes)

### Step 1: Update `.env` File
Add/update these variables in your `backend/.env`:

```bash
# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_SERVICE=gmail

# Application Settings
FRONTEND_URL=http://localhost:5174
APP_NAME=BitMine

# Optional: Email Rate Limiting
MAX_EMAILS_PER_HOUR=5
MAX_EMAILS_PER_DAY=20

# Optional: Email Timeouts
EMAIL_CONNECTION_TIMEOUT_MS=5000
EMAIL_SOCKET_TIMEOUT_MS=5000
```

### Step 2: Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Windows Computer" (or your OS)
3. Generate app password
4. Copy 16-character password to `EMAIL_PASSWORD`

### Step 3: Restart Backend
```bash
cd backend
npm run dev
```

Watch for: `✅ Email transporter verified`

### Step 4: Test with Real Signup
Register a test account at http://localhost:5174/signup  
Check inbox for welcome email ✅

---

## What's Included

| Feature | Status | Trigger |
|---------|--------|---------|
| Welcome Email | ✅ | User signup |
| Order Confirmation | ✅ | Payment verified |
| Order Shipped | ✅ | Status → shipped |
| Order Delivered | ✅ | Status → delivered |
| Order Cancelled | ✅ | Order cancelled |

---

## Security Built-In ✅

- ✅ Rate limiting (5 emails/hour per user)
- ✅ HTML sanitization (XSS prevention)
- ✅ Non-blocking sends (no timeout issues)
- ✅ Auto-retry with backoff
- ✅ No sensitive data in emails
- ✅ Secure SMTP connection
- ✅ Detailed error logging

---

## Troubleshooting Quick Fixes

**Emails not sending?**
1. Check `EMAIL_USER` and `EMAIL_PASSWORD` in .env
2. Verify Gmail 2-FA is enabled
3. Use app password (not regular password)
4. Restart backend: `npm run dev`

**Rate limit errors?**
- Increase `MAX_EMAILS_PER_HOUR` in .env
- Restart backend

**Connection timeouts?**
- Increase `EMAIL_CONNECTION_TIMEOUT_MS` to 10000
- Check internet connection

---

## Testing Commands

```bash
# Test welcome email (signup)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@gmail.com",
    "password": "TestPass123!@#"
  }'

# Test order emails (after payment)
# Check /orders/verify-payment in orders dashboard
```

---

## Files Modified/Created

```
backend/
├── src/
│   ├── utils/
│   │   └── emailService.js          ✅ NEW - Email service utility
│   └── routes/
│       ├── auth.js                  ✅ UPDATED - Welcome email on signup
│       └── orders.js                ✅ UPDATED - All order email triggers
└── .env                             ✅ UPDATE - Add email config

root/
└── EMAIL_NOTIFICATION_SETUP.md      ✅ NEW - Full documentation
```

---

## Next Steps

1. ✅ Update `.env` with Gmail credentials
2. ✅ Restart backend server
3. ✅ Test with signup
4. ✅ Test with test order
5. ✅ Monitor console for logs
6. ✅ Deploy to production

---

**Status:** Ready to use! 🎉

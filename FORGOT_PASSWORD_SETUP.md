# Forgot Password Implementation Guide

## Overview
A complete forgot password feature has been implemented with OTP (One-Time Password) verification sent to the user's Gmail address.

## Features Implemented

### Backend Changes

1. **Database Schema** (`backend/src/database/schema.sql`)
   - Added `password_reset_otps` table to store OTP records with:
     - User ID reference
     - Email address
     - 6-digit OTP code
     - Expiration timestamp (10 minutes)
     - Used status flag
   - Added indexes for faster queries on email and expiration

2. **Authentication Routes** (`backend/src/routes/auth.js`)
   - **POST `/auth/forgot-password`** - Request OTP
     - Accepts user email
     - Generates 6-digit OTP
     - Sends OTP via Gmail
     - Returns success message
   
   - **POST `/auth/verify-otp-reset-password`** - Reset Password
     - Accepts email, OTP, and new password
     - Validates OTP (checks expiration and marks as used)
     - Updates user password with new hashed password
     - Returns success message

### Frontend Changes

1. **New Page** (`frontend/src/pages/ForgotPasswordPage.tsx`)
   - Two-step form:
     - **Step 1**: Enter email to receive OTP
     - **Step 2**: Enter OTP and new password (with confirmation)
   - Client-side validation
   - Toast notifications for feedback
   - Ability to go back and request new OTP

2. **Updated LoginPage** (`frontend/src/pages/LoginPage.tsx`)
   - Added "Forgot password?" link below password field
   - Links to `/forgot-password` route

3. **Updated Routing** (`frontend/src/App.tsx`)
   - Added route for `/forgot-password`
   - Component is eager-loaded (immediate access)

## Environment Setup

Update your `.env` file in the backend directory with Gmail credentials:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### How to Get Gmail App Password

1. Go to https://myaccount.google.com
2. Navigate to **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Search for "App passwords" in the search bar
5. Select **Mail** and **Windows Computer** (or your device)
6. Google will generate a 16-character password
7. Copy this password to `EMAIL_PASSWORD` in your `.env`

## Database Migration

When you deploy this feature, you need to add the new table. Run:

```bash
cd backend
npm install  # if nodemailer isn't installed
npx psql -U bitmine_user -d bitmine_db -f src/database/schema.sql
```

Or manually run in PostgreSQL:

```sql
-- Create password reset OTPs table
CREATE TABLE password_reset_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX idx_password_reset_otps_expires_at ON password_reset_otps(expires_at);
```

## API Endpoints

### 1. Request OTP
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "OTP sent to your email address"
}
```

**Response (Error):**
```json
{
  "error": "Email validation failed"
}
```

### 2. Verify OTP and Reset Password
**POST** `/auth/verify-otp-reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Response (Error):**
```json
{
  "error": "Invalid or expired OTP"
}
```

## Flow Diagram

```
User → Click "Forgot Password?" → ForgotPasswordPage
                                       ↓
                              Enter Email & Submit
                                       ↓
                         Backend sends OTP to Gmail
                                       ↓
                         User receives email with OTP
                                       ↓
                            User enters OTP + New Password
                                       ↓
                          Backend verifies OTP & updates password
                                       ↓
                         User is redirected to Login Page
                                       ↓
                        User logs in with new password
```

## Security Features

1. **OTP Expiration**: 10 minutes
2. **One-time Use**: Each OTP can only be used once (marked with `is_used` flag)
3. **Password Hashing**: New password is hashed with bcryptjs before storage
4. **Email Validation**: User must provide valid email address
5. **Password Requirements**: Minimum 8 characters

## Testing the Feature

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow:**
   - Go to Login page → Click "Forgot password?"
   - Enter a registered user's email
   - Check Gmail inbox/spam folder for OTP
   - Enter OTP and new password
   - Click "Reset Password"
   - You should see success message and be redirected to login
   - Login with the new password

## Troubleshooting

### OTP Email Not Sending
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- Verify Gmail account has 2-step verification enabled
- Check if app password was used (not regular password)
- Check backend logs for error messages

### OTP Expiration Issues
- Default is 10 minutes. To adjust, modify in `auth.js`:
  ```javascript
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Change 10 to desired minutes
  ```

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `password_reset_otps` table exists
- Check database credentials in `.env`

## Files Modified/Created

### Created:
- `frontend/src/pages/ForgotPasswordPage.tsx` - New forgot password page

### Modified:
- `backend/src/routes/auth.js` - Added forgot password routes
- `backend/src/database/schema.sql` - Added password_reset_otps table
- `frontend/src/pages/LoginPage.tsx` - Added forgot password link
- `frontend/src/App.tsx` - Added route for forgot password page

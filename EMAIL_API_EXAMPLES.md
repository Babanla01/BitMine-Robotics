# 📧 Email Integration - API Examples & Testing

## 1. User Registration (Welcome Email)

### Request
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@gmail.com",
  "password": "SecurePass123!@#"
}
```

### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "role": "user",
    "profile_completed": false
  }
}
```

### What Happens Behind the Scenes
```javascript
✅ User created in database
✅ JWT token generated
✅ Refresh token created
✅ Welcome email queued (async)
  └─ Sent within 1-2 seconds
```

### Email Received
```
From: BitMine <your-email@gmail.com>
To: john.doe@gmail.com
Subject: Welcome to BitMine! 🎉

[Professional HTML email with:
 - Welcome greeting
 - Getting started guide
 - Call-to-action button
 - Footer with company info]
```

---

## 2. Payment Verification (Order Confirmation)

### Request
```bash
POST /api/orders/verify-payment
Content-Type: application/json

{
  "reference": "566000002468614"
}
```

### Response
```json
{
  "success": true,
  "message": "Payment verified and order created",
  "order": {
    "id": 1,
    "order_number": "ORD-1705859400000",
    "customer_name": "Jane Smith",
    "customer_email": "jane@gmail.com",
    "order_status": "processing",
    "payment_status": "completed",
    "total_amount": 45000,
    "created_at": "2025-01-21T10:30:00Z"
  },
  "isDuplicate": false
}
```

### What Happens Behind the Scenes
```javascript
✅ Payment verified with Paystack
✅ Order created in database
✅ Order items inserted
✅ Order confirmation email queued (async)
  └─ Sent within 1-2 seconds
```

### Email Received
```
From: BitMine <your-email@gmail.com>
To: jane@gmail.com
Subject: Order Confirmation: ORD-1705859400000 ✓

[Professional HTML email with:
 - Order number & date
 - Itemized list with quantities & prices
 - Delivery address
 - Total amount (NGN currency formatted)
 - Shipping timeframe]
```

### Example Email Content
```
Order Number: ORD-1705859400000
Date: 1/21/2025

Items:
- BitMine Course Bundle (x2)    ₦15,000    ₦30,000
- Premium Tutor Session (x1)    ₦15,000    ₦15,000

Subtotal: ₦45,000
Total Amount: ₦45,000

Delivery Address:
123 Main Street
Lagos, Lagos 100001

Note: Your order typically ships within 1-2 business days.
You'll receive a shipping notification email once dispatched.
```

---

## 3. Order Shipped (Status Update)

### Request
```bash
PUT /api/orders/1/status
Content-Type: application/json

{
  "order_status": "shipped"
}
```

### Response
```json
{
  "message": "Order status updated",
  "order": {
    "id": 1,
    "order_number": "ORD-1705859400000",
    "customer_name": "Jane Smith",
    "order_status": "shipped",
    "updated_at": "2025-01-21T14:22:33Z"
  }
}
```

### What Happens Behind the Scenes
```javascript
✅ Order status updated to "shipped"
✅ Fetches all order items
✅ Shipped notification email queued (async)
  └─ Sent within 1-2 seconds
```

### Email Received
```
From: BitMine <your-email@gmail.com>
To: jane@gmail.com
Subject: Your Order is On the Way! 📦

[Professional HTML email with:
 - Green status badge: SHIPPED
 - Order number & shipped date
 - Estimated delivery: 3-5 business days
 - List of items shipped
 - Delivery address
 - Support contact info]
```

### Example Email Content
```
📦 Your Order is On the Way!

Order Number: ORD-1705859400000
Shipped Date: 1/21/2025
Estimated Delivery: 3-5 business days

Items Shipped:
- BitMine Course Bundle (x2)
- Premium Tutor Session (x1)

Delivery Address:
123 Main Street
Lagos, Lagos 100001

You'll receive another email when your order has been delivered.
If you don't receive it within the estimated timeframe, 
please contact our support team.
```

---

## 4. Order Delivered (Status Update)

### Request
```bash
PUT /api/orders/1/status
Content-Type: application/json

{
  "order_status": "delivered"
}
```

### Response
```json
{
  "message": "Order status updated",
  "order": {
    "id": 1,
    "order_number": "ORD-1705859400000",
    "customer_status": "delivered",
    "updated_at": "2025-01-21T16:45:22Z"
  }
}
```

### What Happens Behind the Scenes
```javascript
✅ Order status updated to "delivered"
✅ Delivery confirmation email queued (async)
  └─ Sent within 1-2 seconds
```

### Email Received
```
From: BitMine <your-email@gmail.com>
To: jane@gmail.com
Subject: Order Delivered: ORD-1705859400000 ✓

[Professional HTML email with:
 - Blue status badge: DELIVERED ✓
 - Order number & delivery date
 - Feedback request
 - Call-to-action for reviews]
```

### Example Email Content
```
✓ Order Delivered!

Order Number: ORD-1705859400000
Delivered Date: 1/24/2025

We hope you're satisfied with your purchase!
If you have any feedback or concerns, please don't hesitate to reach out.

Consider leaving a review for the products you ordered.
Your feedback helps us improve!
```

---

## 5. Order Cancelled (With Optional Reason)

### Request (Admin Cancellation)
```bash
PUT /api/orders/1/cancel
Content-Type: application/json

{
  "reason": "Out of stock - alternative offer sent"
}
```

### Request (No Reason)
```bash
PUT /api/orders/1/cancel
Content-Type: application/json

{}
```

### Response
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-1705859400000",
    "order_status": "cancelled",
    "updated_at": "2025-01-21T15:10:44Z"
  }
}
```

### What Happens Behind the Scenes
```javascript
✅ Order status updated to "cancelled"
✅ Cancellation email queued (async)
  └─ Includes optional reason if provided
  └─ Sent within 1-2 seconds
```

### Email Received
```
From: BitMine <your-email@gmail.com>
To: jane@gmail.com
Subject: Order Cancelled: ORD-1705859400000

[Professional HTML email with:
 - Red status badge: CANCELLED
 - Order number & cancellation date
 - Reason (if provided)
 - Refund information
 - Support contact info]
```

### Example Email Content (With Reason)
```
Order Cancelled

Order Number: ORD-1705859400000
Cancellation Date: 1/21/2025
Reason: Out of stock - alternative offer sent

If you have any questions about this cancellation, 
please contact our support team. 
Any refunds will be processed according to our refund policy.
```

---

## Console Output Examples

### Successful Email Sends
```
✅ Email transporter verified
✅ Email sent successfully to john.doe@gmail.com (Message ID: <000001892f4e0000-abc123@us...>)
✅ Welcome email sent to john.doe@gmail.com

✅ Email sent successfully to jane@gmail.com (Message ID: <000001892f4e0001-def456@us...>)
✅ Order confirmation email sent to jane@gmail.com

✅ Shipped notification sent to jane@gmail.com
✅ Delivered notification sent to jane@gmail.com
✅ Cancellation notification sent to jane@gmail.com
```

### Rate Limiting
```
⚠️  Email rate limit exceeded: Hourly email limit (5) exceeded for user@example.com
```

### Connection Issues
```
⚠️  Email send attempt 1/2 failed for user@example.com: connect ETIMEDOUT
⚠️  Email transporter verification failed: Error: connect ETIMEDOUT 192.168.1.1:587
```

### Failed Retries
```
❌ Email failed after 2 attempts to user@example.com: 550 5.7.1 Invalid credentials for user
❌ Error sending welcome email to user@example.com: Invalid email address
```

---

## Testing Flow

### Complete User Journey
```bash
# 1. User Signs Up
POST /api/auth/register
→ ✅ Welcome email sent

# 2. User Adds Items to Cart & Checks Out
POST /api/orders/initialize-payment
→ Get Paystack authorization URL

# 3. User Makes Payment on Paystack
Paystack Payment Gateway
→ Payment successful

# 4. Backend Verifies Payment
POST /api/orders/verify-payment
→ ✅ Order confirmation email sent

# 5. Admin Ships Order
PUT /api/orders/1/status (shipped)
→ ✅ Shipped notification sent

# 6. Admin Marks as Delivered
PUT /api/orders/1/status (delivered)
→ ✅ Delivery confirmation sent

# 7. (Optional) Admin Cancels Order
PUT /api/orders/1/cancel
→ ✅ Cancellation email sent
```

---

## Rate Limiting Details

Default limits (configurable in `.env`):
- **5 emails per hour** to same recipient
- **20 emails per day** to same recipient

Example Scenarios:
```javascript
// Scenario 1: User signs up multiple times
Attempt 1 → ✅ Email sent (Count: 1/5)
Attempt 2 → ✅ Email sent (Count: 2/5)
Attempt 3 → ✅ Email sent (Count: 3/5)
Attempt 4 → ✅ Email sent (Count: 4/5)
Attempt 5 → ✅ Email sent (Count: 5/5)
Attempt 6 → ❌ BLOCKED (Rate limit exceeded)

// Scenario 2: Retry mechanism still respects rate limit
Failed email → Retry 1 → ✅ Sent (counts as new)
Failed email → Retry 2 → ❌ Rate limit if needed
```

---

## Security Features in Action

### HTML Sanitization
```javascript
Input:  "John <script>alert('xss')</script> Doe"
Output: "John &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt; Doe"

Input:  'Order "Special" > $1000'
Output: 'Order &quot;Special&quot; &gt; $1000'
```

### Non-Blocking Operations
```
User Registration Response
├─ Create user: 10ms
├─ Generate token: 5ms
├─ Set cookie: 2ms
├─ Return response: 1ms
└─ ✅ SEND to user (24ms TOTAL)

Meanwhile (async):
└─ Send email: 100-200ms
   └─ No impact on user experience
```

### Error Handling
```javascript
// Email fails but operation succeeds
registerUser()
  ├─ Save to DB: ✅
  ├─ Send email: ❌ (connection timeout)
  └─ Return success response: ✅

Console: "⚠️  Failed to send welcome email (non-critical)"
```

---

## Monitoring Email Sends

### Check Email Service Status
```bash
# Look for these in console on startup:
✅ Email transporter verified

# Then for each operation:
✅ Welcome email sent to user@example.com
✅ Order confirmation email sent to customer@example.com
✅ Shipped notification sent to customer@example.com
```

### Monitor Rate Limiting
```bash
# In production, watch for:
⚠️  Email rate limit exceeded messages

# If too many, adjust in .env:
MAX_EMAILS_PER_HOUR=10  # increase from 5
MAX_EMAILS_PER_DAY=40   # increase from 20
```

---

## Production Deployment Notes

1. **Test all emails before going live:**
   - Create test accounts
   - Place test orders
   - Verify all emails arrive

2. **Monitor email sends:**
   - Set up log aggregation
   - Alert on email failures
   - Track bounce rates

3. **Update templates for production:**
   - Add company logo
   - Update contact information
   - Add social media links

4. **Compliance:**
   - Add unsubscribe link (future enhancement)
   - Include privacy policy link
   - Add company address

---

**Last Updated:** January 21, 2026  
**Status:** ✅ Production Ready

# 📊 Email System - Visual Architecture & Flow Diagrams

## 1. Complete Email Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER ACTIONS                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓                    ↓                    ↓
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │   User Signs Up  │  │  Places Order    │  │  Order Updates   │
         │   (Signup Form)  │  │  (Paystack)      │  │  (Admin Panel)   │
         └──────────────────┘  └──────────────────┘  └──────────────────┘
                    ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API ROUTES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  POST /api/auth/register    POST /api/orders/verify   PUT /api/orders/:id/ │
│                             -payment                  status               │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATABASE OPERATIONS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Insert User  │  Create Order  │  Update Order Status                       │
│  (users)      │  (orders)      │  (orders)                                  │
│               │  (order_items) │                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                    ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│          📧 EMAIL SERVICE (Non-Blocking, Async)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  emailService.sendWelcomeEmail()     (Queued)                               │
│  emailService.sendOrderConfirmation()  (Queued)                             │
│  emailService.sendOrderShipped()       (Queued)                             │
│  emailService.sendOrderDelivered()     (Queued)                             │
│  emailService.sendOrderCancelled()     (Queued)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                         ↓
         ┌──────────────────────────────────┐
         │   Security Checks (Local)       │
         ├──────────────────────────────────┤
         │  ✓ Rate Limit Check             │
         │  ✓ HTML Sanitization            │
         │  ✓ Template Selection           │
         └──────────────────────────────────┘
                         ↓
         ┌──────────────────────────────────┐
         │   Nodemailer SMTP               │
         ├──────────────────────────────────┤
         │  - Connect to Gmail SMTP         │
         │  - Send HTML email              │
         │  - Handle response              │
         │  - Retry if failed              │
         └──────────────────────────────────┘
                         ↓
         ┌──────────────────────────────────┐
         │   Gmail SMTP Server             │
         ├──────────────────────────────────┤
         │  - Receive email                │
         │  - Validate                     │
         │  - Route to recipient           │
         └──────────────────────────────────┘
                         ↓
         ┌──────────────────────────────────┐
         │   User Gmail Inbox ✅           │
         ├──────────────────────────────────┤
         │  Subject: Welcome to BitMine!    │
         │  Or: Order Confirmation          │
         │  Or: Order Shipped 📦            │
         │  Or: Order Delivered ✓           │
         │  Or: Order Cancelled             │
         └──────────────────────────────────┘
```

---

## 2. Request-Response Timeline

```
User Signs Up
    │
    ├─ 1ms: Receive request
    ├─ 2ms: Validate input (Joi schema)
    ├─ 5ms: Check if email exists
    ├─ 8ms: Hash password (bcrypt)
    ├─ 10ms: Insert user in database
    ├─ 2ms: Generate JWT token
    ├─ 3ms: Create refresh token
    ├─ 1ms: Set cookie
    │
    └─ 32ms: ✅ SEND RESPONSE TO USER
            (User gets response, registration complete)
    
    Meanwhile (Background):
    ├─ 100-200ms: Send welcome email (async)
    │            ├─ Rate limit check
    │            ├─ Sanitize content
    │            ├─ Select template
    │            ├─ Connect to SMTP
    │            ├─ Send HTML email
    │            └─ Log result
    │
    └─ Email arrives in inbox ✅
```

---

## 3. Email Service Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              /backend/src/utils/emailService.js             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONFIG LAYER                                             │
│  ├─ Email credentials (env vars)                          │
│  ├─ Transporter setup (nodemailer)                        │
│  ├─ Rate limiting map                                     │
│  └─ Timeout configurations                                │
│                                                             │
│  SECURITY LAYER                                           │
│  ├─ checkEmailRateLimit()                                 │
│  ├─ sanitizeHtml()                                        │
│  └─ Transporter verification                             │
│                                                             │
│  TEMPLATE LAYER                                           │
│  ├─ emailTemplates.welcome                                │
│  ├─ emailTemplates.orderConfirmation                      │
│  ├─ emailTemplates.orderShipped                           │
│  ├─ emailTemplates.orderDelivered                         │
│  └─ emailTemplates.orderCancelled                         │
│                                                             │
│  SEND LAYER (Core)                                        │
│  ├─ sendEmail(options)                                    │
│  │  ├─ Rate limit check                                   │
│  │  ├─ Retry logic (exponential backoff)                 │
│  │  ├─ Error handling                                     │
│  │  └─ Logging                                            │
│  └─ Returns: { success, messageId, error }               │
│                                                             │
│  PUBLIC API LAYER                                         │
│  ├─ sendWelcomeEmail(email, name)                         │
│  ├─ sendOrderConfirmationEmail(orderData)                 │
│  ├─ sendOrderShippedEmail(orderData)                      │
│  ├─ sendOrderDeliveredEmail(orderData)                    │
│  └─ sendOrderCancelledEmail(orderData)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Rate Limiting Flow

```
Email Send Request
        │
        ├─ Check if email has been tracked
        │
        ├─ Count emails in last hour
        │
        ├─ Is count >= MAX_EMAILS_PER_HOUR?
        │   ├─ YES → ❌ BLOCKED (Return error)
        │   └─ NO → Continue
        │
        ├─ Count emails in last day
        │
        ├─ Is count >= MAX_EMAILS_PER_DAY?
        │   ├─ YES → ❌ BLOCKED (Return error)
        │   └─ NO → Continue
        │
        ├─ Clean up old timestamps (>1 day)
        │
        ├─ Add current timestamp to list
        │
        └─ ✅ ALLOWED (Proceed to send)


RATE LIMIT MAP (In-Memory Storage):
┌──────────────────────────────────────┐
│ "user1@gmail.com": [                 │
│   1705859400000  (1 hour ago)        │
│   1705859500000  (58 min ago)        │
│   1705859600000  (57 min ago)        │
│   1705859700000  (55 min ago)        │
│   1705859800000  (53 min ago)        │
│ ]  ← 5 emails in last hour = AT LIMIT │
│                                      │
│ "user2@gmail.com": [                 │
│   1705859200000  (2 hours ago)       │
│ ]  ← 1 email = ALLOWED               │
└──────────────────────────────────────┘

Default Limits (Configurable):
├─ MAX_EMAILS_PER_HOUR = 5
├─ MAX_EMAILS_PER_DAY = 20
└─ Auto-cleanup of timestamps >24h old
```

---

## 5. Security Layers Visualized

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LAYER 1: INPUT VALIDATION                                 │
│  ├─ Email format validation (Joi schema)                   │
│  ├─ Name length validation                                 │
│  └─ Order data validation                                  │
│      ↓                                                      │
│  LAYER 2: RATE LIMITING                                    │
│  ├─ Check hourly limit (5 per hour)                       │
│  ├─ Check daily limit (20 per day)                        │
│  └─ Prevent flood/spam attacks                            │
│      ↓                                                      │
│  LAYER 3: HTML SANITIZATION                                │
│  ├─ Escape: & < > " '                                     │
│  ├─ Applied to all user-generated content                 │
│  └─ Prevent XSS attacks                                    │
│      ↓                                                      │
│  LAYER 4: TEMPLATE INJECTION                               │
│  ├─ Safe template strings                                 │
│  ├─ No eval() or dynamic code execution                   │
│  └─ Pre-defined templates only                            │
│      ↓                                                      │
│  LAYER 5: SECURE SMTP TRANSMISSION                         │
│  ├─ TLS/SSL encryption (Gmail enforced)                   │
│  ├─ Connection timeout (5 seconds)                        │
│  ├─ Socket timeout (5 seconds)                            │
│  └─ Credentials from env vars only                        │
│      ↓                                                      │
│  LAYER 6: ERROR HANDLING                                   │
│  ├─ Non-critical failures (don't block operations)        │
│  ├─ Detailed error logging                                │
│  ├─ Retry logic with backoff                              │
│  └─ Never expose sensitive data in errors                 │
│      ↓                                                      │
│  LAYER 7: DATA PROTECTION                                  │
│  ├─ Never send passwords                                  │
│  ├─ Never send API keys                                   │
│  ├─ Never send full credit card numbers                   │
│  └─ Only send necessary customer data                     │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Error Handling & Retry Flow

```
Send Email Request
        │
        ├─ ATTEMPT 1
        │   ├─ Connect to SMTP
        │   ├─ Send email
        │   └─ ❌ TIMEOUT after 5s
        │
        ├─ WAIT 1 second (exponential backoff)
        │
        ├─ ATTEMPT 2
        │   ├─ Reconnect to SMTP
        │   ├─ Send email
        │   └─ ❌ 550 Error (invalid address)
        │
        ├─ WAIT 2 seconds (exponential backoff)
        │
        ├─ ATTEMPT 3
        │   ├─ Reconnect to SMTP
        │   ├─ Send email
        │   └─ ✅ SUCCESS (Message ID: abc123)
        │
        └─ Return: { success: true, messageId: "abc123" }


RETRY CONFIGURATION BY EMAIL TYPE:
┌─────────────────────────────────────┐
│ Welcome Email:  2 retries (5 attempts) │
│ Order Confirm:  3 retries (4 attempts) │
│ Shipped/Delivered: 2 retries (3 attempts)│
│ Cancelled:      2 retries (3 attempts)│
└─────────────────────────────────────┘

EXPONENTIAL BACKOFF TIMING:
├─ Retry 1: After 1 second   (1s)
├─ Retry 2: After 2 seconds  (2s = 1s × 2)
├─ Retry 3: After 4 seconds  (4s = 2s × 2)
└─ Retry 4: After 8 seconds  (8s = 4s × 2)
```

---

## 7. Integration Points Map

```
AUTH ROUTES (/backend/src/routes/auth.js)
    │
    ├─ POST /register
    │   ├─ Create user in DB
    │   ├─ Generate token
    │   ├─ Create refresh token
    │   │
    │   └─ ASYNC: sendWelcomeEmail()
    │           └─ emailService.js
    │
    └─ POST /forgot-password
        └─ (Already sends OTP email via existing code)


ORDERS ROUTES (/backend/src/routes/orders.js)
    │
    ├─ POST /initialize-payment
    │   └─ (Paystack API call)
    │
    ├─ POST /verify-payment
    │   ├─ Verify with Paystack
    │   ├─ Create order + items
    │   │
    │   └─ ASYNC: sendOrderConfirmationEmail()
    │           └─ emailService.js
    │
    ├─ PUT /:id/status
    │   ├─ Update order status
    │   │
    │   ├─ If status === "shipped":
    │   │   └─ ASYNC: sendOrderShippedEmail()
    │   │           └─ emailService.js
    │   │
    │   └─ If status === "delivered":
    │       └─ ASYNC: sendOrderDeliveredEmail()
    │               └─ emailService.js
    │
    └─ PUT /:id/cancel
        ├─ Update status to "cancelled"
        │
        └─ ASYNC: sendOrderCancelledEmail()
                └─ emailService.js
```

---

## 8. Data Flow Example - Complete Order Journey

```
STEP 1: USER SIGNS UP
┌─────────────────────────────────────────┐
│ User submits registration form          │
│ Email: john@gmail.com, Name: John       │
└─────────────────────────────────────────┘
            ↓
        [Backend]
            ├─ Hash password
            ├─ Create user record
            ├─ Generate JWT token
            │
            └─ Queue: sendWelcomeEmail({
                    email: "john@gmail.com",
                    name: "John"
                })
                    ↓
                EMAIL: "Welcome to BitMine! 🎉"
                INBOX: john@gmail.com ✅


STEP 2: USER ADDS TO CART & CHECKS OUT
┌─────────────────────────────────────────┐
│ User initiates payment                  │
└─────────────────────────────────────────┘
            ↓
        POST /initialize-payment
        [Paystack API]
            ├─ Generate payment link
            └─ Return authorization_url


STEP 3: USER PAYS
┌─────────────────────────────────────────┐
│ User completes Paystack payment         │
└─────────────────────────────────────────┘
            ↓
        POST /verify-payment (reference code)
        [Backend]
            ├─ Verify payment with Paystack
            ├─ Create order in DB
            ├─ Create order_items in DB
            │
            └─ Queue: sendOrderConfirmationEmail({
                    customerName: "John",
                    customerEmail: "john@gmail.com",
                    orderNumber: "ORD-1705859400000",
                    items: [...],
                    totalAmount: 45000,
                    ...
                })
                    ↓
                EMAIL: "Order Confirmation: ORD-1705859400000 ✓"
                INBOX: john@gmail.com ✅


STEP 4: ADMIN SHIPS ORDER
┌─────────────────────────────────────────┐
│ Admin clicks "Mark as Shipped"          │
└─────────────────────────────────────────┘
            ↓
        PUT /orders/1/status
        Body: { order_status: "shipped" }
        [Backend]
            ├─ Update orders table
            ├─ Fetch order + items data
            │
            └─ Queue: sendOrderShippedEmail({
                    customerName: "John",
                    customerEmail: "john@gmail.com",
                    orderNumber: "ORD-1705859400000",
                    items: [...],
                    estimatedDelivery: "3-5 business days"
                })
                    ↓
                EMAIL: "Your Order is On the Way! 📦"
                INBOX: john@gmail.com ✅


STEP 5: ADMIN MARKS DELIVERED
┌─────────────────────────────────────────┐
│ Admin clicks "Mark as Delivered"        │
└─────────────────────────────────────────┘
            ↓
        PUT /orders/1/status
        Body: { order_status: "delivered" }
        [Backend]
            ├─ Update orders table
            │
            └─ Queue: sendOrderDeliveredEmail({
                    customerName: "John",
                    customerEmail: "john@gmail.com",
                    orderNumber: "ORD-1705859400000"
                })
                    ↓
                EMAIL: "Order Delivered: ORD-1705859400000 ✓"
                INBOX: john@gmail.com ✅


ALTERNATIVE FLOW: ORDER CANCELLED
┌─────────────────────────────────────────┐
│ Admin clicks "Cancel Order"             │
└─────────────────────────────────────────┘
            ↓
        PUT /orders/1/cancel
        Body: { reason: "Out of stock" }
        [Backend]
            ├─ Update status to "cancelled"
            │
            └─ Queue: sendOrderCancelledEmail({
                    customerName: "John",
                    customerEmail: "john@gmail.com",
                    orderNumber: "ORD-1705859400000",
                    reason: "Out of stock"
                })
                    ↓
                EMAIL: "Order Cancelled: ORD-1705859400000"
                INBOX: john@gmail.com ✅
```

---

## 9. Performance Optimization Diagram

```
Traditional Synchronous (SLOW - BLOCKING):
┌────────────────────────────────────────────┐
│ User Request                               │
│ ├─ Process (10ms)                         │
│ ├─ Send Email (100-200ms) ⏳ BLOCKING     │
│ └─ Return Response (1ms)                  │
│ TOTAL: ~110-210ms                         │
└────────────────────────────────────────────┘


BitMine Implementation (FAST - NON-BLOCKING):
┌────────────────────────────────────────────┐
│ User Request                               │
│ ├─ Process (10ms)                         │
│ ├─ Queue Email (async)                    │
│ └─ Return Response (1ms)                  │
│ TOTAL: ~11ms ✅ (18x faster!)             │
│                                            │
│ Meanwhile (background):                    │
│ └─ Send Email (100-200ms, non-blocking)   │
└────────────────────────────────────────────┘

RESULT:
User gets response in ~11ms
Email arrives in inbox in ~100-200ms
No impact on user experience ✅
```

---

## 10. Status Code Summary

```
Operation Responses:
─────────────────────────────────────────

Registration Success:
├─ 201 Created
├─ User inserted in DB ✅
├─ Token generated ✅
└─ Welcome email queued ✅

Order Confirmation Success:
├─ 200 OK
├─ Order created in DB ✅
├─ Order items inserted ✅
└─ Confirmation email queued ✅

Status Update Success:
├─ 200 OK
├─ Order status updated ✅
├─ Status email queued (shipped/delivered) ✅
└─ Non-blocking ✅

Cancellation Success:
├─ 200 OK
├─ Order status set to "cancelled" ✅
└─ Cancellation email queued ✅

Email Rate Limit Hit:
├─ Email send returns: { success: false }
├─ Error: "Email rate limit exceeded"
├─ User operation continues normally ✅
└─ Email not sent (to prevent spam)

Email Send Failure (non-critical):
├─ User operation succeeds ✅
├─ Email fails (after 3 retries)
├─ Error logged in console
└─ User unaffected (async)
```

---

**Last Updated:** January 21, 2026  
**Visual Diagrams:** 10 Complete  
**Status:** ✅ Production Ready

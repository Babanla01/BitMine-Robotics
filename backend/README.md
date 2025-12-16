# BitMine Backend API

Complete backend server for BitMine Robotics website built with Express.js and Node.js.

## 🚀 Getting Started

### Installation

```bash
cd backend
npm install
```

### Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Run Production

```bash
npm start
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:userId` - Get user cart
- `PUT /api/cart/update/:userId/:productId` - Update cart item
- `DELETE /api/cart/remove/:userId/:productId` - Remove from cart
- `DELETE /api/cart/clear/:userId` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/status` - Update order status

### Contact Forms
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all submissions (admin)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe
- `GET /api/newsletter` - Get subscriptions (admin)

### Tutor Applications
- `POST /api/tutor` - Submit tutor application
- `GET /api/tutor` - Get all applications (admin)
- `PUT /api/tutor/:id/status` - Update application status

### Partner Applications
- `POST /api/partner` - Submit partner inquiry
- `GET /api/partner` - Get all inquiries (admin)
- `PUT /api/partner/:id/status` - Update inquiry status

### Admin Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/analytics` - Get analytics data

### Payments
- `POST /api/payment/initiate` - Initiate payment
- `POST /api/payment/verify` - Verify payment

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── index.js              # Main application entry
│   └── routes/
│       ├── auth.js           # Authentication routes
│       ├── products.js       # Product routes
│       ├── cart.js           # Cart routes
│       ├── orders.js         # Order routes
│       ├── contact.js        # Contact form routes
│       ├── newsletter.js     # Newsletter routes
│       ├── tutor.js          # Tutor application routes
│       ├── partner.js        # Partner inquiry routes
│       ├── admin.js          # Admin dashboard routes
│       └── payment.js        # Payment routes
├── package.json              # Dependencies
├── .env.example              # Environment variables template
└── README.md                 # This file
```

---

## 🔧 Technologies Used

- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **JWT** - Authentication tokens
- **Morgan** - HTTP logging
- **Nodemailer** - Email sending
- **Dotenv** - Environment configuration

---

## ⚠️ Important Notes

### Mock Data
Currently, the backend uses in-memory mock data for development. Replace with actual database:
- PostgreSQL
- MongoDB
- MySQL

### Security
Before deploying to production:
1. Hash passwords using `bcryptjs`
2. Implement proper JWT token validation
3. Add input validation and sanitization
4. Use HTTPS
5. Implement rate limiting
6. Add database encryption

### Email
To enable email functionality:
1. Set up Nodemailer with your email provider
2. Or integrate with EmailJS API
3. Update environment variables

### Payments
To enable payments:
1. Sign up with Paystack or Flutterwave
2. Add API keys to `.env`
3. Implement payment verification logic

---

## 🚀 Deployment

### Heroku
```bash
heroku create bitmine-backend
git push heroku main
```

### Railway, Render, or AWS
Follow provider-specific deployment instructions

---

## 📝 Next Steps

1. **Database Integration** - Replace mock data with real database
2. **Email Service** - Configure Nodemailer or SendGrid
3. **Payment Gateway** - Integrate Paystack/Flutterwave
4. **Authentication** - Implement proper JWT validation middleware
5. **Validation** - Add request body validation
6. **Testing** - Add unit and integration tests
7. **Documentation** - Generate API documentation with Swagger

---

## 📧 Support

For issues or questions, contact: bitmineroboticscw@gmail.com

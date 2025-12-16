# 🎨 How to Visualize PostgreSQL Data - Complete Guide

## 📊 5 Ways to View Your Database Data

---

## 1️⃣ **Command Line (Free, No Install)**

### Most Direct Way - Inside PostgreSQL Terminal

```bash
# Connect to your database
psql -U bitmine_user -d bitmine_db

# You're now in the PostgreSQL terminal - prompt shows:
bitmine_db=#
```

### View All Users
```sql
SELECT * FROM users;
```

Output:
```
 id |   name   |       email        |               password               | role  |        created_at         
----+----------+--------------------+--------------------------------------+-------+---------------------------
  1 | John Doe | john@example.com   | $2b$10$N9qo8uLOickgx2ZM... | user  | 2025-12-01 10:30:45.123
  2 | Jane Doe | jane@example.com   | $2b$10$N9qo8uLOickgx2ZM... | admin | 2025-12-01 10:31:22.456
(2 rows)
```

### View All Products
```sql
SELECT * FROM products;
```

### View All Orders
```sql
SELECT * FROM orders;
```

### View Specific Columns Only
```sql
SELECT id, name, email, role FROM users;
```

### View with Formatting
```sql
\x  -- Turn on expanded display
SELECT * FROM users;
```

Better output:
```
-[ RECORD 1 ]----------
id       | 1
name     | John Doe
email    | john@example.com
password | $2b$10$N9qo8uLOickgx2ZM...
role     | user
created_at | 2025-12-01 10:30:45.123

-[ RECORD 2 ]----------
id       | 2
name     | Jane Doe
email    | jane@example.com
password | $2b$10$N9qo8uLOickgx2ZM...
role     | admin
created_at | 2025-12-01 10:31:22.456
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
```

Output:
```
 count 
-------
     2
(1 row)
```

### Exit Terminal
```sql
\q
```

---

## 2️⃣ **pgAdmin (GUI - Recommended for Beginners)**

### What is pgAdmin?
- Visual interface to manage PostgreSQL
- Click buttons instead of typing SQL
- See data in nice tables
- No command line needed

### Installation (macOS)

```bash
# Using Homebrew
brew install pgadmin4

# Start pgAdmin
pgadmin4
```

Or download from: https://www.pgadmin.org/download/

### How to Use pgAdmin

1. **Open pgAdmin** (http://localhost:5050)
2. **Login** with default credentials (or setup new ones)
3. **Add Server Connection:**
   - Right-click "Servers"
   - Click "Register" → "Server"
   - **Name:** bitmine_db
   - **Host:** localhost
   - **Port:** 5432
   - **Username:** bitmine_user
   - **Password:** bitmine123
   - Click "Save"

4. **View Data:**
   - Expand: Servers → bitmine_db → Schemas → public → Tables
   - Right-click any table
   - Select "View/Edit Data" → "All Rows"

5. **See Table Structure:**
   - Right-click table → "Properties"
   - View columns, data types, constraints

### Screenshots
```
Servers
├── bitmine_db
│   ├── Schemas
│   │   └── public
│   │       └── Tables
│   │           ├── users          ← Click here
│   │           ├── products       ← Click here
│   │           ├── orders         ← Click here
│   │           ├── cart_items
│   │           ├── order_items
│   │           ├── newsletter_subscriptions
│   │           ├── contact_submissions
│   │           ├── tutor_applications
│   │           └── partner_applications
```

### Advantages
✅ Visual interface  
✅ No SQL knowledge needed  
✅ Can edit data directly  
✅ See relationships visually  
✅ Export/import data  

---

## 3️⃣ **DBeaver (Advanced GUI - My Favorite)**

### What is DBeaver?
- Professional database tool
- More powerful than pgAdmin
- Free community edition
- Supports many databases

### Installation (macOS)

```bash
brew install dbeaver-community
```

Or download: https://dbeaver.io/download/

### Setup Connection

1. **Open DBeaver**
2. **File** → **New Database Connection**
3. **Select PostgreSQL** → Click **Next**
4. **Connection Settings:**
   - Host: localhost
   - Port: 5432
   - Database: bitmine_db
   - Username: bitmine_user
   - Password: bitmine123
5. **Test Connection** → **Finish**

### View Data

1. **Left Panel:** Expand connection tree
2. **Double-click table** (e.g., "users")
3. **See data in main window**

### Features
- SQL editor
- Data export (Excel, CSV, JSON)
- ER diagrams (see relationships)
- Query builder
- Data editing

---

## 4️⃣ **VS Code Extension (Built-in Editor)**

### Install Extension

1. **Open VS Code**
2. **Extensions** (Ctrl+Shift+X or Cmd+Shift+X)
3. **Search:** "PostgreSQL"
4. **Install:** "PostgreSQL" by Chris Kolkman

### Setup

1. **Click** PostgreSQL icon in left sidebar
2. **Click** "Add Connection"
3. **Fill in details:**
   - Host: localhost
   - Database: bitmine_db
   - User: bitmine_user
   - Password: bitmine123
   - Port: 5432

### View Data

1. **Expand connection** in sidebar
2. **Expand database** → **Tables**
3. **Right-click table** → **Run Select Top 100**
4. **View results** in editor

### Advantages
✅ No need to leave VS Code  
✅ Run SQL queries directly  
✅ Lightweight  
✅ Free  

---

## 5️⃣ **Online Tools (No Installation)**

### DBeaver Online (Web Version)
Go to: https://dbeaver.io/cloudbeaver/

- No installation needed
- Similar to desktop version
- Limited free tier

### Adminer
Go to: https://www.adminer.org/

- Lightweight online tool
- Can use directly

---

## 🔍 Useful SQL Queries to See Your Data

### View All Users
```sql
SELECT id, name, email, role, created_at FROM users;
```

### View All Products
```sql
SELECT id, name, price, category, stock FROM products;
```

### View All Orders
```sql
SELECT o.id, u.name, o.total_price, o.status, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id;
```

### Count Users
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Count Products
```sql
SELECT COUNT(*) as total_products FROM products;
```

### View Total Revenue
```sql
SELECT SUM(total_price) as total_revenue FROM orders;
```

### View Orders by Status
```sql
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;
```

### View User with Most Orders
```sql
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY order_count DESC;
```

### View Top 10 Best Selling Products
```sql
SELECT p.id, p.name, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

### View Newsletter Subscribers
```sql
SELECT email, created_at FROM newsletter_subscriptions WHERE subscribed = true;
```

### View Contact Form Submissions
```sql
SELECT name, email, subject, created_at FROM contact_submissions;
```

---

## 📊 Comparison: Which Tool Should You Use?

| Tool | Best For | Difficulty | Installation |
|------|----------|------------|--------------|
| **psql (CLI)** | Developers | Hard | Already installed |
| **pgAdmin** | Beginners | Easy | Brew install |
| **DBeaver** | Professionals | Medium | Brew install |
| **VS Code Ext** | Developers | Easy | Quick install |
| **Online Tools** | Quick checks | Very Easy | None |

**My Recommendation:**
- **Just checking data?** → Use **psql** or **VS Code Extension**
- **Regular use?** → Use **DBeaver**
- **New to databases?** → Use **pgAdmin**

---

## 🎬 Step-by-Step: First Time Viewing Data

### Using pgAdmin (Easiest)

```bash
# 1. Install pgAdmin
brew install pgadmin4

# 2. Start pgAdmin
pgadmin4

# 3. Open browser to http://localhost:5050

# 4. Login (default: pgadmin4@pgadmin.org / admin)

# 5. Right-click Servers → Register → Server
#    - Name: bitmine_db
#    - Host: localhost
#    - Port: 5432
#    - Username: bitmine_user
#    - Password: bitmine123
#    - Save

# 6. Navigate to:
#    Servers → bitmine_db → Schemas → public → Tables → users

# 7. Right-click users → View/Edit Data → All Rows

# 8. See your data!
```

---

## 🐛 Troubleshooting

### "Connection refused"
**Problem:** Can't connect to database

**Solution:**
```bash
# Make sure PostgreSQL is running
brew services start postgresql@15

# Verify
brew services list | grep postgresql
```

### "Database not found"
**Problem:** Can't find bitmine_db

**Solution:**
```bash
# Create database if missing
psql -U postgres
CREATE DATABASE bitmine_db;
GRANT ALL PRIVILEGES ON DATABASE bitmine_db TO bitmine_user;
\q
```

### "No data showing"
**Problem:** Tables are empty

**Solution:**
- Tables are empty after setup
- Add test data first:
```sql
INSERT INTO users (name, email, password, role)
VALUES ('Test User', 'test@example.com', 'password123', 'user');

SELECT * FROM users;
```

---

## 📝 Quick Reference

### Connect to database
```bash
psql -U bitmine_user -d bitmine_db
```

### View all tables
```sql
\dt
```

### View table structure
```sql
\d users
```

### View all data
```sql
SELECT * FROM users;
```

### View formatted data
```sql
\x
SELECT * FROM users;
```

### Count rows
```sql
SELECT COUNT(*) FROM users;
```

### Exit
```sql
\q
```

---

## 🎯 Next Steps

1. **Choose your tool:**
   - Quick & simple → **psql** or **VS Code**
   - Visual & easy → **pgAdmin**
   - Professional → **DBeaver**

2. **Connect to your database**

3. **Run queries to see data**

4. **Try the example queries** above

5. **Start building your app!**

---

**Ready to visualize your data?** Pick a tool and follow the steps above! 🚀

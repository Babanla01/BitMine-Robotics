# PostgreSQL Comprehensive Guide - Complete Explanation

## 📚 Table of Contents
1. What is PostgreSQL?
2. How It Works
3. Installation Steps (macOS, Windows, Linux)
4. Database Concepts Explained
5. Setup Process in Detail
6. How Your Backend Connects
7. Common Operations
8. Troubleshooting

---

## 1️⃣ What is PostgreSQL?

### Simple Explanation
PostgreSQL is a **database management system** - think of it like a powerful filing cabinet that stores your app's data in organized tables.

**Example:**
- Without database: Data is lost when app restarts
- With database: Data persists forever in organized tables

### Why PostgreSQL for BitMine?
✅ **Reliable** - Won't lose data  
✅ **Powerful** - Can handle complex queries  
✅ **Free** - Open source  
✅ **Popular** - Industry standard  
✅ **Secure** - Built-in security features  

---

## 2️⃣ How It Works (Architecture)

### The Three-Layer Structure

```
┌─────────────────────────────────────────┐
│         Your React Frontend             │
│   (what users see in browser)           │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTP Requests (JSON)
                   ↓
┌─────────────────────────────────────────┐
│       Your Express.js Backend           │
│   (handles requests, processes logic)   │
└──────────────────┬──────────────────────┘
                   │
                   │ SQL Queries
                   ↓
┌─────────────────────────────────────────┐
│       PostgreSQL Database               │
│   (stores actual data in tables)        │
└─────────────────────────────────────────┘
```

### Data Flow Example: User Registration

```
1. User fills form in React → clicks "Sign Up"
   Frontend sends: { name: "John", email: "john@example.com", password: "123" }

2. Backend Express.js receives the request
   Hashes the password for security
   Creates SQL query: INSERT INTO users (name, email, password) VALUES (...)

3. PostgreSQL receives SQL query
   Validates data
   Stores in "users" table
   Returns: "Success - user created"

4. Backend sends response back to frontend
   Frontend shows: "Account created successfully!"

5. Data is now PERMANENTLY stored in PostgreSQL
   Even if app crashes, data is safe
```

---

## 3️⃣ Installation Steps

### **macOS (Using Homebrew)**

#### Step 1: Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Install PostgreSQL
```bash
brew install postgresql@15
```

What this does:
- Downloads PostgreSQL version 15 from the internet
- Installs it on your machine
- Sets up the necessary files and folders

#### Step 3: Start PostgreSQL Service
```bash
brew services start postgresql@15
```

What this does:
- Starts the PostgreSQL server in the background
- Your database is now running 24/7 (until you stop it)
- It listens on port 5432 (the default)

#### Step 4: Verify Installation
```bash
psql -U postgres -c "SELECT version();"
```

Expected output:
```
PostgreSQL 15.x on x86_64-apple-darwin...
```

---

### **Windows**

#### Step 1: Download Installer
Go to: https://www.postgresql.org/download/windows/

#### Step 2: Run Installer
- Click the executable file
- Choose installation directory (default is fine)
- Set password for "postgres" user (remember this!)
- Keep default port 5432
- Complete installation

#### Step 3: Verify
Open Command Prompt:
```bash
psql -U postgres -c "SELECT version();"
```

---

### **Linux (Ubuntu/Debian)**

```bash
# Update package manager
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Enable auto-start on boot
sudo systemctl enable postgresql
```

---

## 4️⃣ Database Concepts Explained

### **Databases** (Plural: Top Level)
A database is a container that holds all your tables and data.

```
PostgreSQL Server
│
├── bitmine_db (our database)
│   ├── users table
│   ├── products table
│   ├── orders table
│   └── other tables
│
├── other_db
│   └── other tables
```

Think: **Database = Project**

---

### **Tables** (Contains Rows and Columns)
A table is like a spreadsheet with rows and columns.

**Example: Users Table**
```
┌────┬──────────┬─────────────────────────┬──────────┬────────┐
│ id │  name    │ email                   │ password │ role   │
├────┼──────────┼─────────────────────────┼──────────┼────────┤
│ 1  │ John Doe │ john@example.com        │ hash...  │ user   │
│ 2  │ Jane Doe │ jane@example.com        │ hash...  │ admin  │
│ 3  │ Bob Smith│ bob@example.com         │ hash...  │ user   │
└────┴──────────┴─────────────────────────┴──────────┴────────┘
```

Think: **Table = Spreadsheet Sheet**

---

### **Rows** (Records)
Each row is one record/entry.

```
Row 1: id=1, name="John Doe", email="john@example.com", ...
Row 2: id=2, name="Jane Doe", email="jane@example.com", ...
```

Think: **Row = One entry (like one contact)**

---

### **Columns** (Fields/Attributes)
Each column stores one type of information.

```
Columns in users table:
- id: unique identifier number
- name: person's name (text)
- email: person's email (text)
- password: hashed password (text)
- role: admin or user (text)
```

Think: **Column = Property (like "email" or "name")**

---

### **Primary Key**
Unique identifier for each row (can't be duplicated).

```
id is the PRIMARY KEY
- Row 1: id = 1 (unique)
- Row 2: id = 2 (unique)
- Can't have two rows with id = 1
```

Think: **Primary Key = Social security number (everyone has different one)**

---

### **Relationships**
Tables can reference each other.

```
orders table references users table:
┌──────────────────────────────────────────┐
│ Orders Table                             │
├─────┬──────────┬──────────────────────┤
│ id  │ user_id  │ total_price          │
├─────┼──────────┼──────────────────────┤
│ 1   │ 1 ↶ ──────→ John Doe (from users)
│ 2   │ 2 ↶ ──────→ Jane Doe (from users)
│ 3   │ 1 ↶ ──────→ John Doe (from users)
└─────┴──────────┴──────────────────────┘
```

Think: **Relationship = One-to-many connection (one user can have many orders)**

---

## 5️⃣ Setup Process in Detail

### **Step 1: Create a Database**

```bash
psql -U postgres
```

This connects to PostgreSQL as the "postgres" admin user.

You'll see:
```
postgres=#
```

This is the PostgreSQL prompt (like a terminal inside PostgreSQL).

---

### **Step 2: Create Database**

Type this command:
```sql
CREATE DATABASE bitmine_db;
```

What it does:
- Creates a new database called "bitmine_db"
- This is where all BitMine data will live
- Think: Creating a new project folder

Expected response:
```
CREATE DATABASE
```

---

### **Step 3: Create Database User**

```sql
CREATE USER bitmine_user WITH PASSWORD 'bitmine123';
```

What it does:
- Creates a user account called "bitmine_user"
- Password is "bitmine123"
- This user will own the database
- Similar to: creating a username/password for a service

Why separate user?
- Security: Backend uses this user to access database
- Permissions: Can limit what this user can do
- Audit: Can track what this user did

---

### **Step 4: Grant Permissions**

```sql
GRANT ALL PRIVILEGES ON DATABASE bitmine_db TO bitmine_user;
```

What it does:
- Gives "bitmine_user" full access to "bitmine_db"
- Without this, user can't read/write data
- Think: Giving someone keys to your house

Additional permission setup:
```sql
ALTER ROLE bitmine_user SET client_encoding TO 'utf8';
ALTER ROLE bitmine_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bitmine_user SET default_transaction_deferrable TO on;
ALTER ROLE bitmine_user SET default_transaction_read_committed TO on;
```

These optimize performance and ensure consistency.

---

### **Step 5: Exit PostgreSQL**

```
\q
```

Takes you back to your terminal.

---

### **Step 6: Create Tables**

Create file: `src/database/schema.sql` with all table definitions.

Run it:
```bash
psql -U bitmine_user -d bitmine_db -f src/database/schema.sql
```

What this does:
- Connects as "bitmine_user" to "bitmine_db"
- Reads the schema.sql file
- Executes all SQL commands to create tables
- Creates: users, products, orders, etc.

---

## 6️⃣ How Your Backend Connects

### **Connection String**
```
postgresql://bitmine_user:bitmine123@localhost:5432/bitmine_db
```

Breaking it down:
```
postgresql://          ← Database type
bitmine_user           ← Username
:bitmine123            ← Password
@localhost             ← Server address (your computer)
:5432                  ← Port number
/bitmine_db            ← Database name
```

---

### **Backend Connection Code**

In `src/config/database.js`:

```javascript
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',          // Where database is running
  port: 5432,                 // PostgreSQL default port
  database: 'bitmine_db',     // Which database to use
  user: 'bitmine_user',       // Username
  password: 'bitmine123',     // Password
});
```

What happens:
1. Backend starts
2. Creates connection pool (multiple connections to database)
3. Waits for requests
4. When request comes, uses a connection to query database
5. Returns results

---

### **How Queries Work**

Example: Login endpoint
```javascript
// User submits: email="john@example.com", password="123456"

const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  ['john@example.com']
);

// What happens:
// 1. Backend sends SQL query to PostgreSQL
// 2. PostgreSQL searches users table
// 3. Finds row where email matches
// 4. Returns: { id: 1, name: "John", email: "john@example.com", ... }
// 5. Backend checks if password matches
// 6. Sends response to frontend
```

---

## 7️⃣ Common Operations

### **Connect to Database Manually**

```bash
psql -U bitmine_user -d bitmine_db
```

You're now inside the database - can run SQL commands directly.

---

### **View All Tables**

```sql
\dt
```

Shows:
```
           List of relations
 bitmine_db=#
        Schema |         Name         | Type  | Owner
--------+----------------------+-------+----------------
 public | users                | table | bitmine_user
 public | products             | table | bitmine_user
 public | orders               | table | bitmine_user
```

---

### **View Table Structure**

```sql
\d users
```

Shows columns and their data types:
```
                Table "public.users"
 Column  |          Type          | Modifiers
---------+------------------------+----------
 id      | integer                | primary key
 name    | character varying(255) |
 email   | character varying(255) | unique
 password| character varying(255) |
 role    | character varying(50)  |
```

---

### **View Data in Table**

```sql
SELECT * FROM users;
```

Shows all rows:
```
 id | name     | email               | role
----+----------+---------------------+------
 1  | John Doe | john@example.com    | user
 2  | Jane Doe | jane@example.com    | admin
```

---

### **Insert Data**

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Bob Smith', 'bob@example.com', 'hashed_password_123', 'user');
```

Adds new user to table.

---

### **Update Data**

```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

Changes John Doe's role to admin.

---

### **Delete Data**

```sql
DELETE FROM users WHERE id = 1;
```

Removes John Doe from database.

---

### **Exit Database**

```sql
\q
```

---

## 8️⃣ Troubleshooting

### **Problem: "Connection refused"**

**Cause:** PostgreSQL is not running

**Solution:**
```bash
brew services start postgresql@15
```

**Check status:**
```bash
brew services list | grep postgresql
```

---

### **Problem: "User does not exist"**

**Cause:** User "bitmine_user" wasn't created

**Solution:**
Connect as admin and create user:
```bash
psql -U postgres
CREATE USER bitmine_user WITH PASSWORD 'bitmine123';
```

---

### **Problem: "Database does not exist"**

**Cause:** Database "bitmine_db" wasn't created

**Solution:**
```bash
psql -U postgres
CREATE DATABASE bitmine_db;
GRANT ALL PRIVILEGES ON DATABASE bitmine_db TO bitmine_user;
```

---

### **Problem: "Port 5432 already in use"**

**Cause:** Another PostgreSQL instance is running

**Solution (macOS):**
```bash
lsof -i :5432
kill -9 <PID>
brew services restart postgresql@15
```

---

### **Problem: "Password authentication failed"**

**Cause:** Wrong password in connection string

**Solution:**
1. Use correct password in `.env` file
2. Or reset password:
   ```bash
   psql -U postgres
   ALTER USER bitmine_user WITH PASSWORD 'new_password';
   ```

---

## 9️⃣ Complete Setup Checklist

- [ ] PostgreSQL installed (`brew install postgresql@15`)
- [ ] PostgreSQL running (`brew services start postgresql@15`)
- [ ] Database created (`CREATE DATABASE bitmine_db;`)
- [ ] User created (`CREATE USER bitmine_user WITH PASSWORD 'bitmine123';`)
- [ ] Permissions granted (`GRANT ALL PRIVILEGES...`)
- [ ] Tables created (`psql -U bitmine_user -d bitmine_db -f schema.sql`)
- [ ] `.env` file created with correct credentials
- [ ] `npm install pg bcryptjs` completed
- [ ] Backend started (`npm run dev`)
- [ ] Connection successful (check console output)

---

## 🔟 Your BitMine Data Storage

After setup, your database looks like:

```
PostgreSQL Server (localhost:5432)
│
└── bitmine_db (database)
    ├── users (table)
    │   ├── john@example.com (row)
    │   ├── jane@example.com (row)
    │   └── bob@example.com (row)
    │
    ├── products (table)
    │   ├── Robotics Kit - Beginner (row)
    │   ├── Advanced Robotics Kit (row)
    │   └── Coding Book Series (row)
    │
    ├── orders (table)
    │   ├── Order #1 by John (row)
    │   └── Order #2 by Jane (row)
    │
    └── ... (other tables)
```

---

## Summary

**PostgreSQL = Organized data storage**
- Your frontend sends requests to backend
- Backend queries PostgreSQL
- PostgreSQL returns data
- Backend sends response to frontend
- Data is permanently saved

**Why PostgreSQL > storing in .json file:**
- Multiple users can access simultaneously
- Data won't be lost
- Can do complex queries
- Built-in security
- Performance optimized for large data

---

**Ready to set up? Follow these commands:**

```bash
# 1. Install & start PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 2. Create database & user
psql -U postgres
# Paste all CREATE commands

# 3. Create tables
cd backend
psql -U bitmine_user -d bitmine_db -f src/database/schema.sql

# 4. Setup .env file
# Add DB credentials

# 5. Install packages & start
npm install pg bcryptjs
npm run dev
```

**That's it! Your database is now running!** 🎉

# 🚌 CloudPass — Cloud-Based Bus Pass System

A fully cloud-hosted bus pass management system built for the **CodeAlpha Cloud Computing Internship — Task 3**.

---

## 📌 Project Description

CloudPass is an online bus pass booking system that allows users to register, log in, apply for a bus pass, and view their existing passes — all hosted on **Microsoft Azure**. It prevents ticket loss, theft, duplicate passes, and incorrect pricing through secure server-side logic and cloud database storage.

---

## 🛠 Technologies Used

| Layer      | Technology              |
|------------|------------------------|
| Frontend   | HTML, CSS, JavaScript  |
| Backend    | Node.js + Express      |
| Database   | Azure SQL Database      |
| Hosting    | Azure App Service       |
| Version Control | GitHub            |

---

## ☁️ Azure Services Used

- **Azure App Service** — Hosts the Node.js backend and serves the frontend
- **Azure SQL Database** — Stores all users and bus pass records
- **Azure SQL Server** — Manages the database instance
- **Azure Resource Group** — Organizes all cloud resources

---

## ✅ Features

- 🔐 User Registration and Login
- 🎫 Apply for Bus Pass (Student / Monthly / Quarterly)
- 🔁 Prevents duplicate active passes per user
- 💰 Server-side price calculation (users cannot manipulate prices)
- 📋 View all issued passes
- 🌐 Fully deployed and publicly accessible
- 📱 Mobile responsive design

---

## 💳 Pass Types & Pricing

| Pass Type      | Price  |
|----------------|--------|
| Student Pass   | ₹300   |
| Monthly Pass   | ₹500   |
| Quarterly Pass | ₹1200  |

> Prices are calculated **only on the server**. Users never send price values.

---

## 🗄️ Database Tables

### Users
| Column   | Type         |
|----------|-------------|
| id       | INT (PK)    |
| name     | NVARCHAR    |
| email    | NVARCHAR    |
| password | NVARCHAR    |

### BusPasses
| Column      | Type         |
|-------------|-------------|
| id          | INT (PK)    |
| user_id     | INT (FK)    |
| route       | NVARCHAR    |
| destination | NVARCHAR    |
| pass_type   | NVARCHAR    |
| price       | DECIMAL     |
| pass_number | NVARCHAR    |
| status      | NVARCHAR    |
| created_at  | DATETIME    |

---

## 📁 Project Structure

```
CloudPass/
├── index.html      → Single-page frontend UI
├── style.css       → Professional blue responsive design
├── script.js       → Frontend logic and API calls
├── server.js       → Express backend with all API routes
├── package.json    → Node.js dependencies
├── setup.sql       → Azure SQL table creation script
├── .env            → Environment variables (not pushed to GitHub)
├── .gitignore      → Ignores node_modules and .env
└── README.md       → This file
```

---

## 🔌 API Routes

| Method | Route           | Description               |
|--------|----------------|---------------------------|
| POST   | /register       | Create new user account   |
| POST   | /login          | Authenticate user         |
| POST   | /apply-pass     | Apply for a new bus pass  |
| GET    | /pass/:userId   | Get all passes for a user |

---

## 🚀 Deployment

### Azure Setup Steps
1. Create Resource Group
2. Create Azure SQL Server + Database
3. Run `setup.sql` in Azure SQL Query Editor
4. Create Azure App Service (Node.js 18 LTS)
5. Connect GitHub repository for CI/CD
6. Set environment variables in App Service → Configuration
7. Deploy and access the live URL

### Environment Variables (set in Azure App Service)
```
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=your-server.database.windows.net
DB_NAME=cloudpassdb
```

---

## 💻 Local Installation

```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_CloudPass.git
cd CodeAlpha_CloudPass
npm install
# Fill in your .env file
node server.js
```
Then open `http://localhost:3000` in your browser.

---

## 🧪 Test Cases

| # | Test                         | Expected Result                     |
|---|------------------------------|-------------------------------------|
| 1 | Register new user            | Account created successfully        |
| 2 | Login with correct password  | Dashboard shown                     |
| 3 | Login with wrong password    | Error message shown                 |
| 4 | Apply for bus pass           | Pass generated with correct price   |
| 5 | Apply for second pass        | Duplicate error shown               |
| 6 | View passes                  | All passes listed with details      |
| 7 | Refresh page                 | Login required again (stateless)    |

---

## 📋 Task Requirements Fulfilled

| Requirement                    | Implementation                          |
|--------------------------------|-----------------------------------------|
| Ticket loss prevention         | All data stored in Azure SQL            |
| Ticket theft prevention        | Login authentication required           |
| Incorrect pricing prevention   | Prices calculated server-side only      |
| High traffic scalability       | Azure App Service auto-scaling          |
| Reliability                    | Azure SQL with built-in redundancy      |
| Cloud deployment               | Azure App Service (publicly accessible) |

---

## 👤 Author

**CodeAlpha Cloud Computing Internship**
Task 3 — Cloud-Based Bus Pass System

---

## 📄 License

MIT License

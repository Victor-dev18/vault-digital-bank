# VaultDigital 🏦

VaultDigital is a secure, full-stack, enterprise-grade digital banking platform. It features a real-time financial engine for deposits and transfers, a modern responsive UI, and an automated fraud-detection system with a role-based Admin Command Center.

---

## 🚀 Features

* **Secure Authentication**
  User registration and login protected by bcrypt password hashing and JWT (JSON Web Tokens) session management.

* **Real-Time Financial Engine**
  Instant wallet-to-wallet transfers, account top-ups, and live balance tracking.

* **Fraud Detection System**
  Automated backend logic that flags suspiciously large transactions for administrative review.

* **Role-Based Access Control (RBAC)**
  Dedicated dark-mode Admin Portal to monitor system-wide alerts and instantly freeze/unfreeze compromised accounts.

* **Modern UI/UX**
  Fully responsive, "Neobrutalist" fintech design built with Tailwind CSS, ensuring perfect scaling across mobile, tablet, and desktop devices.

---

## 🛠️ Tech Stack

### Frontend

* React / Next.js (App Router)
* Tailwind CSS
* Fetch API for backend integration

### Backend & Database

* Node.js / Express.js
* MongoDB (Mongoose ORM)
* JSON Web Tokens (JWT) & bcrypt
* CORS for secure cross-origin requests

---

## ⚙️ Getting Started

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vault-digital-bank.git
cd vault-digital-bank
```

---

### 2. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and add your secret credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:

```bash
npx nodemon server.js
```

---

### 3. Frontend Setup

Open a second terminal and navigate to the frontend folder:

```bash
cd frontend/digital-bank-project
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

---

### 4. Access the Application

* User Dashboard: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🔐 Security Highlights

* Password hashing using bcrypt
* Stateless authentication with JWT
* Protected routes and middleware
* Input validation and sanitization
* Fraud monitoring logic for abnormal activity

---

## 📌 Future Enhancements

* UPI-like payment system (mobile/email-based transfers)
* AI-based fraud detection (ML models)
* Transaction analytics dashboard
* Multi-currency wallet support
* Email/SMS notifications (Twilio integration)

---

## 👤 Author

**Victor Devanand Kongala**

---

## ⭐ Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

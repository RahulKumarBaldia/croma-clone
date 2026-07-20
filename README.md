# 🛒 Croma Clone

🚀 **Live Demo:** Click Here

A full-stack e-commerce web application inspired by **Croma**, built using the **MERN Stack**. Users can browse electronic products, search and filter items, manage their shopping cart, make secure payments with Razorpay, and place orders. It also includes an admin panel for managing products.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 👤 User Signup & Login
- 🔐 JWT Authentication
- 📱 Browse Electronic Products
- 🔍 Search Products
- 🎯 Filter Products
- 🛒 Add to Cart
- ➕ Update Cart Quantity
- ❌ Remove Items from Cart
- 💳 Razorpay Payment Gateway Integration
- 📦 Place Orders
- 🛠️ Admin Dashboard
- ➕ Add Products
- ✏️ Edit Products
- 🗑️ Delete Products

---

## 🛠 Tech Stack

**Frontend**

- React.js
- Vite
- Tailwind CSS

**Backend**

- Node.js
- Express.js
- MongoDB (Mongoose)

**Authentication**

- JWT
- bcryptjs

**Payments**

- Razorpay

**Other Packages**

- dotenv
- cors
- nodemailer

---

## 🚀 Getting Started

### Prerequisites

- Node.js Installed
- MongoDB Installed
- Razorpay Account

### Installation

Clone the repository

```bash
git clone https://github.com/RahulKumarBaldia/croma-clone.git

cd croma-clone
```

### Setup Backend

```bash
cd Backend

npm install
```

Create a `.env` file inside the **Backend** folder

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Start the backend server

```bash
npm run dev
```

### Setup Frontend

```bash
cd ../Frontend

npm install
```

Create a `.env` file inside the **Frontend** folder

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY=your_razorpay_key
```

Start the frontend

```bash
npm run dev
```

---

## 📸 Screenshots

### Home Page

![Home Page](screenshots/Home.png)

### Products Page

![Products Page](screenshots/Products.png)

### Cart Page

![Cart Page](screenshots/Cart.png)

### Checkout

![Checkout](screenshots/Checkout.png)

### Admin Dashboard

![Admin Dashboard](screenshots/Admin.png)

---

## 🤝 Author

**Rahul Kumar**

- GitHub: **[@RahulKumarBaldia](https://github.com/RahulKumarBaldia)**
# TechQuiz

A modern full-stack quiz platform built using the MERN stack. The project provides a complete online quiz system with user authentication, admin management, quiz creation, result tracking, and a responsive UI.

---

# Features

## User Features

* User authentication and authorization
* Attempt quizzes online
* View quiz results instantly
* Responsive and modern UI
* Real-time score calculation
* Secure login system

## Admin Features

* Admin dashboard
* Create and manage quizzes
* Add, edit, and delete questions
* Manage users
* Track quiz performance and results

## Technical Features

* MERN Stack architecture
* REST API integration
* JWT / Clerk authentication support
* MongoDB database integration
* Responsive frontend design
* Modular folder structure

---

# Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Axios
* React Router DOM

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Authentication

* Clerk Authentication

---

# Project Structure

```bash
TechQuiz/
│
├── frontend/          # User frontend application
├── admin/             # Admin dashboard
├── backend/           # Backend server and APIs
│
├── package.json
├── package-lock.json
└── README.md
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Akhlaqur-Rahman/TechQuiz.git
cd TechQuiz
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside backend folder:

```env
MONGODB_URI=your_mongodb_uri
PORT=8080
CLERK_SECRET_KEY=your_clerk_secret
JWT_SECRET=your_jwt_secret
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Admin Setup

```bash
cd admin
npm install
npm run dev
```

---

# Environment Variables

## Backend `.env`

```env
MONGODB_URI=
PORT=
JWT_SECRET=
CLERK_SECRET_KEY=
```

## Frontend `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

---

# Screenshots

## Home Page

![Home Page](screenshots/home.png)

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Result Page

![Result Page](screenshots/result.png)

---

# API Endpoints

## User APIs

* User Login
* User Signup
* Get User Data

## Quiz APIs

* Create Quiz
* Get All Quizzes
* Submit Quiz
* Get Results

## Admin APIs

* Manage Users
* Manage Questions
* Manage Results

---

# Future Improvements

* Leaderboard system
* Timer-based quizzes
* Dark mode
* AI-generated questions
* Category-wise quizzes
* Analytics dashboard

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

# License

This project is licensed under the MIT License.

---

# Author

**Akhlaqur Rahman**

GitHub: [https://github.com/Akhlaqur-Rahman](https://github.com/Akhlaqur-Rahman)

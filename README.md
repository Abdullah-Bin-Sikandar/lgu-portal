# Lahore Garrison University - Student Portal ERP System

A modern, authentic university management system and ERP portal built for **Lahore Garrison University (LGU)** students and administration.

---

## 🌟 Key Features

### Student Portal
- **Profile Management**: View academic info, enrollment year, semester, contact details, bio, and social links.
- **Student Search Directory**: Live search any student by name, roll number, department, or degree program.
- **Roll Number & Email Sync**: Strict standard formats (`fa-2023-bsse-067` & `fa-2023-bsse-067@lgu.edu.pk`).
- **Profile Pictures**: Upload and update profile pictures.

### Admin Portal
- **Dashboard Overview**: Key metrics (Total students, pending approvals, approved, rejected, suspended).
- **Student Management**: Filter and review students by department, program, session, and status.
- **Pending Approvals**: Review and approve/reject new registration requests with notifications.
- **Audit Logs**: Track administrative and authentication events.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router 7, Tailwind CSS v4, Lucide React, Axios, React Hot Toast
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Authentication, Multer, Helmet, Morgan

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed:samples   # (Optional) Seed admin & sample data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Default Admin Credentials (Seed)
- **Email**: `admin@lgu.edu.pk`
- **Password**: `Admin@LGU2024`

---

## 📄 License
ISC License · Developed by ERP Team.

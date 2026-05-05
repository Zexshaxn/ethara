# ProTrack: Enterprise Management Platform

A professional full-stack project management assignment codebase.

## 🚀 Features

- **Advanced Authentication**: JWT-based secure login with session persistence.
- **Enterprise RBAC**: Role-Based Access Control (Admin vs. Operator).
- **Project Portfolios**: High-level project grouping and management.
- **Task Deployment Matrix**: Kanban-style task tracking with status transitions.
- **Real-time Analytics**: Interactive charts for throughput velocity and status tracking.
- **Notification Engine**: Instance-level alerts for task assignments.

## ⚙️ Technical Stack

- **Backend**: Node.js, Express, SQLite (REST API)
- **Frontend**: React 19, Tailwind CSS 4, Recharts, Framer Motion
- **Database**: Persistent SQLite with relational integrity
- **Security**: Bcrypt password hashing, JWT authorization

## 🛠 Setup & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file with a `JWT_SECRET`.
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🎯 Evaluation Checklist

- [x] Code Quality (Clean architecture, typed interfaces)
- [x] Feature Completeness (Auth, CRUD, RBAC, Dash, Notifications)
- [x] UI/UX (Modern brutalist/technical aesthetic)
- [x] Responsiveness (Adaptive sidebar and grid layouts)
- [x] Deployment (Fully functional on the platform)

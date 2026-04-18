<div align="center">

# 🐛 BugTracker

### A Jira-inspired Project Management & Issue Tracking App

Built with the MERN Stack · Redux Toolkit · Framer Motion

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://your-app.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green?style=for-the-badge)](https://your-api.render.com)

</div>

---

## ✨ Features

| Feature             | Description                                         |
| ------------------- | --------------------------------------------------- |
| 🔐 **JWT Auth**     | Secure register/login with bcrypt                   |
| 📁 **Projects**     | Create, edit, delete projects with team members     |
| 👥 **Team Roles**   | Admin, Manager, Developer, Viewer permissions       |
| 🎫 **Tickets**      | Full CRUD with priority, type, status, due dates    |
| 🗂️ **Kanban Board** | Drag & drop tickets across columns                  |
| 💬 **Comments**     | Threaded comments on tickets with edit/delete       |
| 🔍 **Filters**      | Filter by status, priority, type, assignee + search |
| 📊 **Dashboard**    | Stats overview with progress visualization          |
| 📱 **Responsive**   | Mobile drawer, tablet icons, desktop sidebar        |
| 🎨 **Animations**   | Framer Motion page transitions + skeleton loading   |

---

## 🖼️ Screenshots

> Add screenshots here after deployment

---

## 🧰 Tech Stack

### Frontend

```
React 19          Component-based UI
Redux Toolkit 2   Global state management
React Router 7    Client-side navigation
Tailwind CSS 4    Utility-first styling
Framer Motion     Animations & transitions
@dnd-kit          Drag and drop Kanban
Axios             HTTP client with interceptors
React Hot Toast   Toast notifications
Lucide React      Icon library
```

### Backend

```
Node.js + Express 5   REST API server
MongoDB + Mongoose 9  Database + ODM
JWT                   Authentication tokens
bcryptjs              Password hashing
Helmet + CORS         Security headers
Morgan                HTTP request logging
```

---

## 🗂️ Project Structure

```
bug-tracker/
├── client/                      # React Frontend
│   └── src/
│       ├── app/
│       │   └── store.js         # Redux store
│       ├── components/
│       │   ├── common/          # Reusable UI
│       │   │   ├── Skeleton.jsx
│       │   │   ├── ConfirmModal.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   └── PageTransition.jsx
│       │   ├── layout/          # App layout
│       │   │   ├── Sidebar.jsx
│       │   │   ├── MainLayout.jsx
│       │   │   └── Breadcrumbs.jsx
│       │   ├── projects/        # Project components
│       │   ├── tickets/         # Ticket components
│       │   ├── comments/        # Comment components
│       │   └── kanban/          # Kanban board
│       ├── features/            # Redux slices
│       │   ├── auth/
│       │   ├── projects/
│       │   ├── tickets/
│       │   └── comments/
│       ├── pages/               # Route pages
│       ├── services/            # API service layer
│       └── utils/               # Helpers & permissions
│
└── server/                      # Express Backend
    ├── config/
    │   └── db.js                # MongoDB connection
    ├── controllers/             # Route handlers
    ├── middleware/
    │   └── authMiddleware.js    # JWT verification
    ├── models/                  # Mongoose schemas
    │   ├── User.js
    │   ├── Project.js
    │   ├── Ticket.js
    │   └── Comment.js
    ├── routes/                  # Express routes
    └── index.js                 # Server entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/bug-tracker.git
cd bug-tracker
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bugtracker
JWT_SECRET=your_super_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Reference

### Auth

```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login user
GET    /api/auth/me           Get current user
```

### Projects

```
GET    /api/projects          Get all user projects
POST   /api/projects          Create project
GET    /api/projects/:id      Get single project
PUT    /api/projects/:id      Update project
DELETE /api/projects/:id      Delete project
POST   /api/projects/:id/members          Add member
DELETE /api/projects/:id/members/:userId  Remove member
```

### Tickets

```
GET    /api/tickets/project/:id    Get tickets (+ filters)
POST   /api/tickets                Create ticket
GET    /api/tickets/:id            Get single ticket
PUT    /api/tickets/:id            Update ticket
DELETE /api/tickets/:id            Delete ticket
PATCH  /api/tickets/:id/status     Update status
PATCH  /api/tickets/:id/assign     Assign ticket
```

### Comments

```
GET    /api/comments/ticket/:id    Get ticket comments
POST   /api/comments               Add comment
PUT    /api/comments/:id           Edit comment
DELETE /api/comments/:id           Delete comment
```

---

## 🔐 Role Permissions

| Action            | Owner | Admin | Manager | Developer | Viewer |
| ----------------- | :---: | :---: | :-----: | :-------: | :----: |
| Edit any ticket   |  ✅   |  ✅   |   ✅    |    ❌     |   ❌   |
| Edit own ticket   |  ✅   |  ✅   |   ✅    |    ✅     |   ❌   |
| Delete any ticket |  ✅   |  ✅   |   ❌    |    ❌     |   ❌   |
| Delete own ticket |  ✅   |  ✅   |   ✅    |    ✅     |   ❌   |
| Create tickets    |  ✅   |  ✅   |   ✅    |    ✅     |   ❌   |
| Add comments      |  ✅   |  ✅   |   ✅    |    ✅     |   ❌   |
| Manage members    |  ✅   |  ❌   |   ❌    |    ❌     |   ❌   |

---

## 📅 Built In 14 Days

| Day | Feature                        |
| --- | ------------------------------ |
| 1   | MERN setup, Redux, Tailwind v4 |
| 2   | JWT Authentication             |
| 3   | Projects CRUD + Members        |
| 4   | Tickets backend APIs           |
| 5   | Tickets frontend UI            |
| 6   | Dashboard + Responsive sidebar |
| 7   | Testing + GitHub               |
| 8   | Kanban drag & drop             |
| 9   | Comments system                |
| 10  | Advanced filters + sort        |
| 11  | Role-based permissions         |
| 12  | Deployment                     |
| 13  | Polish + Skeleton UI           |
| 14  | Final testing + demo           |

---

## 🌐 Deployment

- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Database** → [MongoDB Atlas](https://mongodb.com/atlas)

---

## 📄 License

MIT © 2025 [Your Name](https://github.com/YOUR_USERNAME)

---

<div align="center">
  <p>Built with ❤️ as a learning project</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>

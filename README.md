# ☁ StackForge

> **Visual cloud architecture designer** — Drag, connect, and export AWS infrastructure diagrams with real-time cost estimation, security hints, and one-click Terraform export.

![StackForge](https://img.shields.io/badge/StackForge-v0.1.0-2563eb?style=for-the-badge&logo=amazonaws)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Reference](#-api-reference)
- [Pages & Routes](#-pages--routes)
- [AWS Components](#-aws-components)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Drawing Tools](#-drawing-tools)
- [Authentication Flow](#-authentication-flow)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

StackForge is a full-stack web application that lets engineers design cloud infrastructure visually. Instead of writing YAML or Terraform from scratch, you drag AWS components onto an infinite canvas, connect them, and instantly see your monthly cost estimate. When you're ready, export to Terraform or JSON in one click.

**Who is it for?**
- DevOps engineers designing new infrastructure
- Solution architects presenting cloud topologies
- Developers learning AWS architecture patterns
- Teams reviewing and documenting existing setups

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Canvas** | Infinite ReactFlow canvas with drag-and-drop AWS components |
| 💰 **Live Cost Estimation** | Monthly cost updates in real time as you add components |
| 🔒 **Protected Routes** | JWT-based authentication — canvas only accessible after login |
| 💾 **Save & Load** | Save multiple diagrams to MongoDB, load them anytime |
| 📁 **My Diagrams** | Dashboard to view, open, and delete all saved diagrams |
| ⬇ **Terraform Export** | One-click download of a ready-to-use `main.tf` file |
| 📦 **JSON Export** | Export full diagram state as JSON for backup or import |
| ✏️ **Drawing Tools** | 9 tools: select, rectangle, circle, arrow, line, pencil, text, frame, comment |
| 🎨 **Color Palette** | 7 colors for shapes and connections |
| ↔️ **Resizable Nodes** | Drag handles to resize any node or shape |
| ⌨️ **Keyboard Shortcuts** | Full keyboard support for all drawing tools |
| 📱 **Responsive Navbar** | Persistent top bar with save status, cost, and navigation |
| 🌤 **Light Theme** | Clean professional light UI across all pages |

---

## 🛠 Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI framework |
| React Router DOM | 6.26 | Client-side routing |
| ReactFlow | 11.11 | Canvas engine — nodes, edges, drag-and-drop |
| Vite | 5.4 | Build tool and dev server |
| Inter + JetBrains Mono | Google Fonts | Typography |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4.19 | HTTP server and API routing |
| Mongoose | 8.5 | MongoDB ODM |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9.0 | JWT creation and verification |
| cors | 2.8 | Cross-origin request handling |
| dotenv | 16.4 | Environment variable loading |
| nodemon | 3.1 | Dev server auto-restart |

### Database
- **MongoDB** — document database (local via Compass or cloud via Atlas)

---

## 📁 Project Structure

```
StackForge/
├── src/                              # Frontend source root
│   ├── App.jsx                       # Router + AuthProvider setup
│   ├── main.jsx                      # ReactDOM entry point
│   ├── index.html                    # HTML shell
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth state (login, logout, user)
│   ├── services/
│   │   └── api.js                    # All fetch calls to backend API
│   └── components/
│       ├── ProtectedRoute.jsx        # Route guard — redirects to /login
│       ├── ProtectedRoute.css
│       ├── AuthPage/
│       │   ├── AuthPage.jsx          # Login + Signup (shared component)
│       │   ├── AuthPage.css
│       │   └── index.js
│       ├── HomePage/
│       │   ├── HomePage.jsx          # Landing page
│       │   ├── HomePage.css
│       │   └── index.js
│       ├── MyDiagrams/
│       │   ├── MyDiagram.jsx         # Saved diagrams dashboard
│       │   ├── MyDiagrams.css
│       │   └── index.js
│       └── StackForge/
│           ├── StackForgeCanvas.jsx  # Main canvas orchestrator
│           ├── StackForgeCanvas.css
│           ├── CloudNode.jsx         # AWS component node
│           ├── CloudNode.css
│           ├── ShapeNodes.jsx        # Rectangle, Circle, Text, Frame, Comment
│           ├── ShapeNodes.css
│           ├── Sidebar.jsx           # Left panel — cost, filters, components
│           ├── Sidebar.css
│           ├── ComponentCard.jsx     # Draggable sidebar item
│           ├── ComponentCard.css
│           ├── DrawingToolbar.jsx    # Vertical 9-tool toolbar
│           ├── DrawingToolbar.css
│           ├── constants.js          # AWS component definitions
│           └── index.js
│
└── backend/                          # Express API
    ├── server.js                     # Entry point — Express + MongoDB connection
    ├── package.json
    ├── .env                          # Environment variables (not committed)
    ├── models/
    │   ├── User.js                   # User schema with bcrypt password hashing
    │   └── Diagram.js                # Diagram schema with nodes/edges/pencilLines
    ├── middleware/
    │   └── auth.js                   # JWT verification middleware
    ├── controllers/
    │   ├── authController.js         # signup, login, getMe
    │   └── diagramController.js      # CRUD for diagrams
    └── routes/
        ├── auth.js                   # /api/auth routes
        └── diagrams.js               # /api/diagrams routes (all protected)
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** — either:
  - Local: [MongoDB Community](https://www.mongodb.com/try/download/community) + [MongoDB Compass](https://www.mongodb.com/products/compass)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available)
- **Git** — [git-scm.com](https://git-scm.com)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/StackForge.git
cd StackForge
```

**2. Install frontend dependencies**

```bash
npm install
```

**3. Install backend dependencies**

```bash
cd backend
npm install
cd ..
```

---

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```bash
cd backend
cp .env.example .env
```

Then fill in the values:

```env
PORT=5000
MONGO_URI=your_uri
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `your_uri` |
| `JWT_SECRET` | Secret key for signing JWT tokens — keep this private | Any long random string |
| `JWT_EXPIRES_IN` | How long login sessions last | `7d` |
| `CLIENT_URL` | URL of your React frontend — used for CORS | `http://localhost:5173` |

> **Tip:** Generate a secure JWT secret by running:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

> **MongoDB Atlas:** If using cloud MongoDB, your URI will look like:
> ```
> mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/StackForge
> ```

---

### Running the App

Open **two terminals** — one for the backend, one for the frontend.

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 StackForge API running on http://localhost:5000
```

**Terminal 2 — Frontend**

```bash
# from project root
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/auth/signup` | ❌ | Create a new account |
| `POST` | `/auth/login` | ❌ | Login with email & password |
| `GET` | `/auth/me` | ✅ | Get current logged-in user |

**POST `/auth/signup`**
```json
// Request body
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "password": "securepassword"
}

// Response 201
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "firstName": "Ada", "email": "ada@example.com" }
}
```

**POST `/auth/login`**
```json
// Request body
{
  "email": "ada@example.com",
  "password": "securepassword"
}

// Response 200
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "firstName": "Ada", "email": "ada@example.com" }
}
```

---

### Diagrams

All diagram endpoints require the JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/diagrams` | Get all diagrams for logged-in user |
| `POST` | `/diagrams` | Create a new diagram |
| `GET` | `/diagrams/:id` | Get a single diagram by ID |
| `PUT` | `/diagrams/:id` | Update / save an existing diagram |
| `DELETE` | `/diagrams/:id` | Delete a diagram |

**POST `/diagrams`**
```json
// Request body
{
  "name": "Production Architecture",
  "description": "Main production stack",
  "nodes": [...],
  "edges": [...],
  "pencilLines": [...]
}

// Response 201
{
  "success": true,
  "diagram": { "_id": "...", "name": "Production Architecture", "componentCount": 5, "estimatedCost": 220 }
}
```

---

### Health Check

```
GET /api/health
```
```json
{ "success": true, "message": "StackForge API is running.", "timestamp": "2024-..." }
```

---

## 🗺 Pages & Routes

| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | — | Public | Redirects to `/home` |
| `/home` | HomePage | Public | Landing page |
| `/login` | AuthPage | Public | Login form |
| `/signup` | AuthPage | Public | Signup form |
| `/canvas` | StackForgeCanvas | **Protected** | New blank diagram |
| `/canvas/:id` | StackForgeCanvas | **Protected** | Load existing diagram |
| `/diagrams` | MyDiagrams | **Protected** | All saved diagrams |

> **Protected routes** — if you visit `/canvas` or `/diagrams` without being logged in, you are automatically redirected to `/login`. After logging in, you are sent back to the page you originally tried to visit.

---

## ☁ AWS Components

12 AWS components are available in the sidebar:

| Component | Category | Cost/mo |
|-----------|----------|---------|
| ☁ CloudFront CDN | Network | $10 |
| ⚖ Load Balancer | Network | $18 |
| 🌐 API Gateway | Network | $15 |
| 🔗 VPC | Network | $0 |
| 🖥 EC2 Instance | Compute | $35 |
| λ Lambda | Compute | $2 |
| ⚙ EKS Cluster | Compute | $144 |
| 🗄 RDS Database | Database | $120 |
| ⚡ ElastiCache | Database | $65 |
| 🔷 DynamoDB | Database | $25 |
| 🪣 S3 Bucket | Storage | $5 |
| 📨 SQS Queue | Messaging | $1 |

---

## ⌨️ Keyboard Shortcuts

| Key | Tool |
|-----|------|
| `S` | Select |
| `R` | Rectangle |
| `O` | Circle |
| `A` | Arrow |
| `L` | Line |
| `D` | Pencil / Draw |
| `T` | Text |
| `F` | Frame |
| `C` | Comment |

---

## 🎨 Drawing Tools

| Tool | How to use |
|------|-----------|
| **Select** | Click to select nodes, drag to move, scroll to zoom |
| **Rectangle** | Click on canvas to place a resizable rectangle |
| **Circle** | Click on canvas to place a resizable circle |
| **Arrow** | Drag from one node handle to another to create a directed connection |
| **Line** | Same as arrow but renders as a dashed line with no arrowhead |
| **Pencil** | Hold and drag to draw a freehand stroke |
| **Text** | Click to place an editable text block |
| **Frame** | Click to place a labeled container frame |
| **Comment** | Click to place a sticky-note-style comment |

> **Double-click** any shape node to edit its label text inline.
> **Select + drag corners** to resize any node.

---

## 🔐 Authentication Flow

```
User visits /canvas
       │
       ▼
ProtectedRoute checks AuthContext
       │
   ┌───┴───┐
   │       │
No token  Token exists
   │       │
   ▼       ▼
/login   GET /api/auth/me
         verify token
              │
         ┌────┴────┐
         │         │
       Valid    Expired/Invalid
         │         │
         ▼         ▼
      /canvas    /login
```

- Tokens are stored in `localStorage` as `cf_token`
- On every app load, the token is verified with `GET /api/auth/me`
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Passwords are hashed with **bcrypt** (12 salt rounds) before storage — plain passwords are never stored

---

## 🗃 Database Schema

### User
```js
{
  firstName:  String,   // required
  lastName:   String,
  email:      String,   // required, unique, lowercase
  password:   String,   // bcrypt hashed, never returned in queries
  createdAt:  Date,
  updatedAt:  Date
}
```

### Diagram
```js
{
  user:           ObjectId,  // ref → User
  name:           String,    // max 100 chars
  description:    String,    // max 500 chars
  nodes:          Array,     // ReactFlow node objects
  edges:          Array,     // ReactFlow edge objects
  pencilLines:    Array,     // freehand stroke points
  componentCount: Number,    // auto-computed on save
  estimatedCost:  Number,    // auto-computed on save ($/mo)
  createdAt:      Date,
  updatedAt:      Date
}
```

> `componentCount` and `estimatedCost` are automatically recalculated every time a diagram is saved via a Mongoose `pre('save')` hook.

---

## 🌍 Deployment

### Frontend (Vercel / Netlify)

```bash
# Build the frontend
npm run build
# The /dist folder is ready to deploy
```

Set the environment variable on your hosting platform:
```
VITE_API_URL=https://your-backend-url.com/api
```

Then update `src/services/api.js` to use:
```js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```

### Backend (Railway / Render / VPS)

Set the following environment variables on your server:
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.com
```

Start the server:
```bash
npm start
```

### MongoDB Atlas (Cloud Database)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with a secure password
3. Whitelist your server IP (or `0.0.0.0/0` for all IPs)
4. Copy the connection string into your `MONGO_URI`

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repo on GitHub

# 2. Clone your fork
git clone https://github.com/JaiPrakashPS/StackForge.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# 5. Push and open a Pull Request
git push origin feature/your-feature-name
```

### Commit message convention
```
feat:     new feature
fix:      bug fix
style:    CSS / formatting changes
refactor: code restructure without behaviour change
docs:     documentation updates
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License — Copyright (c) 2024 StackForge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

**Built with React + ReactFlow + Express + MongoDB**

<!-- [⭐ Star this repo](https://github.com/JaiPrakashPS/StackForge) · [🐛 Report a bug](https://github.com/YOUR_USERNAME/StackForge/issues) · [💡 Request a feature](https://github.com/YOUR_USERNAME/StackForge/issues) -->

</div>

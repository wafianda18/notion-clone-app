# Notion Clone - Todo App with Trash

Website mirip Notion dengan JWT authentication, CRUD todo, dan fitur Trash (soft delete).

## Default Credentials

- **Email:** admin@notion.com  
- **Password:** password

---

## Project Structure

```
notion-app/
├── backend/
│   ├── server.js     ← API + JWT auth + Trash routes
│   ├── db.json       ← JSON database (todos + trash)
│   ├── package.json
│   └── vercel.json
└── frontend/
    ├── src/
    │   ├── App.jsx         ← Auth state
    │   ├── Dashboard.jsx   ← Main todo page
    │   ├── TrashPage.jsx   ← Trash management page
    │   ├── TodoModal.jsx   ← Create/edit modal
    │   └── api.js          ← API service
    ├── index.html
    ├── vite.config.js
    └── vercel.json
```

---

## Local Development

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local → VITE_API_URL=http://localhost:3001/api
npm run dev
# Runs on http://localhost:5173
```

---

## Deploy ke Vercel

### 1. Deploy Backend
```bash
cd backend
vercel
```
Set env vars di Vercel dashboard:
- `JWT_SECRET` → random string panjang
- `FRONTEND_URL` → URL frontend Vercel kamu

### 2. Deploy Frontend
```bash
cd frontend
vercel
```
Set env vars di Vercel dashboard:
- `VITE_API_URL` → `https://your-backend.vercel.app/api`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login → JWT token |
| GET | /api/auth/me | Yes | Info user |
| GET | /api/todos | Yes | List semua todo |
| POST | /api/todos | Yes | Buat todo baru |
| PUT | /api/todos/:id | Yes | Edit todo |
| PATCH | /api/todos/:id/toggle | Yes | Toggle selesai |
| DELETE | /api/todos/:id | Yes | **Pindah ke Trash** (soft delete) |
| GET | /api/trash | Yes | List isi Trash |
| PATCH | /api/trash/:id/restore | Yes | Restore dari Trash |
| DELETE | /api/trash/:id | Yes | Hapus permanen 1 item |
| DELETE | /api/trash | Yes | Kosongkan semua Trash |

---

## Features

- ✅ JWT Authentication (7 hari)
- ✅ Create, Read, Update todo
- ✅ Toggle complete/incomplete
- ✅ **Soft delete → Trash** (tidak langsung hapus)
- ✅ **Restore dari Trash**
- ✅ **Hapus permanen** dari Trash
- ✅ **Kosongkan Trash** sekaligus
- ✅ Priority (High / Medium / Low)
- ✅ Due date + overdue detection
- ✅ Search dan filter
- ✅ Progress bar sidebar
- ✅ Notion-like UI, responsive

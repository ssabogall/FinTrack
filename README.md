## FinTrack

**FinTrack** is a personal finance web dashboard designed to help users organize, visualize, and optimize their financial management. The platform allows users to record, classify, and manage income and expenses in a structured way, making it easier to analyze financial behavior through tables, key performance indicators (KPIs), and interactive graphical visualizations.

The system provides features for managing custom categories, tracking savings goals, and visualizing monthly financial trends, enabling users to make informed decisions about their personal finances. Additionally, FinTrack includes an administrative panel that offers a global view of the system, from which administrators can manage users, monitor overall statistics, and generate consolidated financial reports.

## Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM, SQLite, JWT, bcrypt
- **Frontend**: Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS, Chart.js, Axios
- **Package manager**: npm

## Project Structure

- `backend/`: NestJS REST API, auth, modules (`users`, `auth`, `categories`, `transactions`, `goals`, `admin`), seed scripts
- `frontend/`: Vue 3 + Vite application (dashboard, admin panel, reports, charts)

## Prerequisites

- **Node.js**: version `^20.19.0` or `>=22.12.0`
- **npm**: comes bundled with Node.js

You can verify your versions with:

```sh
node -v
npm -v
```

## How to Run the Project (Development)

1. **Clone the repository**

   ```sh
   git clone <your-repo-url>
   cd FinTrack
   ```

2. **Install dependencies**

   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Run backend API**

   In one terminal:

   ```sh
   cd backend
   npm run start:dev
   ```

4. **Seed the database (recommended on fresh DB)**

   In another terminal:

   ```sh
   cd backend
   npm run seed
   ```

5. **Run frontend**

   In a separate terminal:

   ```sh
   cd frontend
   npm run dev
   ```

6. **Open the app**

   - Frontend: `http://localhost:5173`
   - Backend API base: `http://localhost:3000/api`

## Environment Configuration

Frontend uses `VITE_API_BASE_URL` to connect to backend.

Create `frontend/.env` (optional if backend runs on default `http://localhost:3000`):

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Authentication Notes

- Login uses backend JWT (`/api/auth/login`).
- Session token is stored in browser local storage.
- On app bootstrap, user session is restored from token.
- Protected routes are enforced in frontend and backend guards.

## Seeded Demo Users

- Admin:
  - `admin@fintrack.local` / `admin123`
- Regular users:
  - `alex.johnson@fintrack.local` / `password123`
  - `maria.lopez@fintrack.local` / `password123`
  - `daniel.kim@fintrack.local` / `password123`
  - `john@email.com` / `password123`
  - `jane@email.com` / `password123`

## Implemented Modules

- **User/Auth**: register, login, profile, role-based access
- **Category**: CRUD with ownership validation
- **Transaction**: CRUD, category/goal linkage, dashboard metrics
- **Goal**: CRUD, progress/status tracking
- **Admin**: global overview, trends, user stats, monthly reports


## Authors

- **Santiago Gómez Ospina**
- **Lucas Higuita**
- **Santiago Sabogal**

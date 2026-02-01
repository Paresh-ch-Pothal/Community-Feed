# 🚀 Community Feed with Gamification

A full-stack social platform featuring a threaded comment system, real-time karma (likes), and a 24-hour rolling leaderboard. Built with **Django REST Framework** and **React (TypeScript)**.

## 🌐 Live Demo
* **Frontend (Vercel):** https://community-feed-theta.vercel.app
* **Backend API (Render):** https://community-feed-f90p.onrender.com

---

## ✨ Features
* **Nested Comment Tree:** Unlimited depth replies modeled with self-referential relationships.
* **Gamification System:** Users earn "Karma" (5 pts for posts, 1 pt for comments).
* **Rolling Leaderboard:** Real-time calculation of top users based on karma received in the last 24 hours.
* **Hybrid Database Support:** Automatically switches between PostgreSQL (Production) and SQLite (Local).

---

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS.
* **Backend:** Python, Django, Django REST Framework.
* **Database:** PostgreSQL (Production), SQLite (Development).
* **Deployment:** Vercel (Frontend), Render (Backend).

---

## 💻 Local Setup Instructions

### 1. Prerequisites
* Python 3.10+
* Node.js 18+

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   #### Windows:
   venv\Scripts\activate
   #### Mac/Linux:
   source venv/bin/activate
   ```
   
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
  
4. Database Configuration: The system is designed to be plug-and-play:
   f you have a DATABASE_URL in your environment variables, the system will connect to PostgreSQL.
   If no URL is found, the system automatically defaults to SQLite (db.sqlite3), making it easy to test locally without database setup.

5. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
 ```bash
   cd frontend
   ```

2. Install packages:
   ```bash
   npm install
   ```

3. Create a .env file in the frontend root and add your backend URL:
   ```bash
   VITE_API_URL=http://127.0.0.1:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
### 4. Testing the Data
  To quickly see the Leaderboard and Comment Tree in action, you can seed the database with test data:
  ```bash
  python seedDb.py
   ```

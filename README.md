# 🏠 FindMySpace - Room & Roommate Finder

**FindMySpace** is a full-stack MERN application designed to simplify the process of finding rooms and roommates.  
The platform supports **4 types of users** with role-based access and personalized features.

---

## 👥 User Roles & Features

### 🔹 1. Room Owner
- Post rooms with **multiple images** (stored in Cloudinary)
- Manage own rooms (**view, edit, delete**)
- View **received bookings** from room seekers
- See **room details**: description, price, owner name, location on map

### 🔹 2. Room Seeker
- Browse **all rooms** with search (by location, profession, budget range)
- Book a room & manage bookings (**view, cancel**)
- View **room details** with map integration
- Access **Dashboard** to find roommates + fill preferences
- **Roommate Matching System**: matches % based on preferences
- Message owners or roommates directly

### 🔹 3. Roommate (Has Room)
- Post room + fill roommate preferences
- Manage rooms (**update, delete, view, received bookings**)
- Room posted here only shows in **Dashboard** (not in All Rooms page)
- Message and interact with potential roommates

### 🔹 4. Roommate (Has No Room)
- Browse all rooms + dashboard
- Book based on **preference-matching system**
- Manage bookings & messages
- Option to book **roommate’s room or entire room**

---

## 🚀 Core Features
- 🔐 **Authentication & Authorization** (role-based access using JWT)
- 🏠 **Room Management** (CRUD operations)
- 📸 **Multiple Image Uploads** (via Cloudinary)
- 🔎 **Advanced Search** (location, profession, budget, preferences)
- 📍 **Map Integration** (view location of rooms)
- 🤝 **Roommate Matching Algorithm** (% match based on preferences)
- 💬 **Messaging System** (owner ↔ seeker, roommate ↔ roommate)
- 📂 **Role-Specific Dashboards**

---

## 🛠️ Tech Stack
**Frontend (client)**  
- React.js  
- TailwindCSS  
- Context API / Hooks  

**Backend (server)**  
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Cloudinary (image storage)  

---
Setup Client:
-cd client
-npm install
-npm start

Setup Server
-cd server
-npm install
-nodemon App.js



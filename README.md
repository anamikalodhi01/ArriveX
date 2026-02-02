# ArriveX – Smart Travel Destination Alert System

##  Project Overview

ArriveX is a full-stack MERN application designed to help travelers avoid missing their destination by providing real-time location tracking and smart destination alerts.

The system tracks the user’s live location using the Browser Geolocation API and triggers alerts based on distance, route and ETA ensuring timely notifications during travel.


##3  Key Features

**User Authentication** - Secure JWT-based signup/login  
**Trip Management** - Complete CRUD operations  
**Multiple Alert Types** - Distance, Route, and ETA-based alerts  
**Real-Time Tracking** - Live GPS location monitoring  
**Smart Alerts** - Sound, notification, and visual alerts  
**Trip History** - Track completed and active trips  
**Simulation Mode** - Test without moving  
**Responsive Design** - Works on desktop  



## Tech Stack

**Frontend:**
- React.js 18 (Vite)
- React Router DOM v6
- Axios
- Browser Geolocation API
- Web Audio API

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Project Structure
``` bash

ArriveX/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── vite.config.js
│
├── .gitignore
└── README.md
```



##  Environment Variables

### Backend
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`

### Frontend
- `VITE_API_URL`


## Getting Started 

### 1. Clone the Repository
``` bash 
git clone https://github.com/anamikalodhi01/ArriveX.git
cd ArriveX
```

### 2. Backend Setup
``` bash 
cd backend
npm install
npm run dev
```
Server will run at 
``` bash
http://localhost:5000
```

### 3. Frontend Setup 
``` bash
cd frontend
npm install
npm run dev
```
Frontend will run at 
``` bash
http://localhost:5173
```


##  How to Use the Application

### 1. Create Account

1. Click "Signup" in navbar
2. Enter your name, email, and password
3. Click "Sign Up"
4. You'll be automatically logged in

### 2. Create a Trip

1. Click "New Trip" or "Create New Trip"
2. Enter destination name (e.g., "Delhi Railway Station")
3. Enter coordinates OR use quick select buttons
4. Choose alert type:
   - **Distance-Based:** Alert when X km away
   - **Route-Based:** Alert based on route
   - **ETA-Based:** Alert X minutes before arrival
5. Configure alert distance/time
6. Add optional notes
7. Click "Create Trip"

### 3. Start Tracking

**Option 1: Real GPS Tracking**
1. Click "Start Tracking"
2. Allow location permission when prompted
3. Your real location will be tracked
4. Move towards destination to test alert

**Option 2: Simulation Mode (Recommended for Testing)**
1. Click "Test with Simulation"
2. Watch as your position moves towards destination
3. Alert will trigger when configured distance/time is reached

### 4. Receive Alerts

When you reach the alert threshold:
-  **Sound Alert** plays
-  **Browser Notification** shows (if permitted)
-  **Visual Popup** appears
-  **Vibration** (on mobile devices)

### 5. Complete Trip

1. Click "Complete Trip" when you reach destination
2. Trip will be marked as completed
3. View it in trip history

## Learning Outcomes

This project demonstrates:

* Full-stack MERN development

* REST API design

* JWT authentication

* Real-time geolocation handling

* Frontend–backend integration

* Clean Git commit practices using conventional commit

* Scalable project structure

##  Future Enhancements

* Google Maps route visualization

* Push notifications

* Offline support

* Friend/shared trip tracking


## Author

**Anamika Lodhi**  
B.Tech CSE | MERN Stack Developer





# E-Commerce Website

A full-stack e-commerce website built with React, Express, Node.js, and MongoDB.

## Features
- Product listings
- Product detail pages
- Shopping cart functionality
- Order processing

## Prerequisites
- Node.js and npm
- MongoDB (running locally or MongoDB Atlas)

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Make sure MongoDB is running locally on port 27017, or update the `MONGODB_URI` in `.env` file.

4. Seed the database with sample products:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on http://localhost:5000

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The frontend will run on http://localhost:3000

## Technologies Used
- **Frontend**: React, Tailwind CSS, Vite, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose

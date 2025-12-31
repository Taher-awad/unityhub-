# UnityHub

UnityHub is a modern social networking platform built with Node.js and Express. It features a modular backend, real-time-like interactions, and a structured database system for managing users, posts, friendships, and messages.

## 🚀 Features

- **Authentication**: Secure Login and Signup system using `bcryptjs` for password hashing.
- **Social Feed**: A dynamic home feed that displays posts from the user and their friends.
- **Interactions**: Like and comment on posts with real-time feedback.
- **Friends System**: Search for users and add them as friends to build your network.
- **Real-time Messaging**: Chat with friends through a dedicated messaging interface.
- **Modular Backend**: Clean and maintainable code structure with separated routes and database configurations.

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/) (using `mysql2`)
- **Templating**: [EJS](https://ejs.co/) (Embedded JavaScript)
- **Authentication**: `bcryptjs`, `express-session`
- **File Uploads**: `multer`
- **Configuration**: `dotenv`

## 📁 Project Structure

```text
unityhub-/
├── config/             # Database configuration
│   └── db.js
├── routes/             # Modular route handlers
│   ├── auth.js         # Login, Signup
│   ├── chat.js         # Messaging
│   ├── friends.js      # Friend management
│   └── posts.js        # Feed, Likes, Comments
├── public/             # Static assets (CSS, JS, Images)
│   ├── uploads/        # User-uploaded files
│   ├── Home.js         # Frontend logic for the home feed
│   └── ... (CSS/HTML files)
├── views/              # EJS Templates
│   └── HOME.ejs
├── db/                 # Database schema scripts
├── .env                # Environment variables (Ignored by git)
├── index.js            # Main application entry point
└── package.json        # Dependencies and scripts
```

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js installed
- MySQL Server running

### 2. Database Setup

- Create a database (e.g., `unityhub2`).
- Run the SQL scripts found in the `db/` directory or file to create the necessary tables.

### 3. Environment Variables

Create a `.env` file in the root directory and add the following:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=unityhub2
SESSION_SECRET=your_secret_key
PORT=3000
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
node index.js
```

The server will start on `http://localhost:3000`.

## 📜 License

This project is licensed under the ISC License.

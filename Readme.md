# 💬 WhatsApp Clone (MERN Stack)

A full-stack real-time chat application inspired by WhatsApp, built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with **Socket.io** for instant messaging.

---

## 🚀 Features

- 🔐 User Authentication (JWT-based)
- 📝 User Registration & Login
- 💬 Real-time One-to-One Chat
- 🟢 Online / Offline User Status
- ⏱️ Message Timestamps
- 🖼️ Profile Picture Upload (Cloudinary)
- 🔎 Search Users
- 📱 Fully Responsive UI
- 🔒 Protected Routes
- 🌙 Modern WhatsApp-inspired Interface
- 📊 Status Updates
- 📞 Video Call Support (Twilio)

---

## 🛠️ Tech Stack

### Frontend
- React.js 19
- Vite
- Tailwind CSS 4
- DaisyUI
- Zustand (State Management)
- React Router DOM
- Axios
- Socket.io Client
- React Hook Form + Yup
- Motion (Animations)
- Emoji Picker React

### Backend
- Node.js
- Express.js 5
- MongoDB + Mongoose
- Socket.io
- JWT (Authentication)
- bcrypt.js (Password Hashing)
- Cloudinary (Image Upload)
- Nodemailer (Email)
- Twilio (SMS/Video Calls)
- Multer (File Upload)

---

## 📂 Project Structure

```
Chat-APP-Whatsapp-clone/
│
├── frontend/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   │   ├── chatSection/
│   │   │   ├── settingSection/
│   │   │   ├── statusSection/
│   │   │   ├── user-login/
│   │   │   └── videoCall/
│   │   ├── services/         # API service functions
│   │   ├── store/            # Zustand state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── assets/           # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js Backend
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.js
│   │   ├── chat.controller.js
│   │   └── status.controller.js
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middlewares/          # Custom middleware
│   ├── configs/              # Configuration files
│   ├── services/            # Business logic services
│   ├── utils/                # Utility functions
│   ├── uploads/              # Uploaded files
│   ├── index.js              # Server entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- npm or yarn

### 1️⃣ Clone the Repository

```
bash
git clone https://github.com/Dharmeshp1582/Chat-APP-Whatsapp-clone.git
cd Chat-APP-Whatsapp-clone
```

### 2️⃣ Backend Setup

```
bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```
env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

Start the backend server:

```
bash
npm run dev    # Development mode (with nodemon)
# OR
npm start      # Production mode
```

### 3️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory:

```
bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```
env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```
bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - Get all users
- `GET /api/auth/user/:id` - Get user by ID

### Chat
- `POST /api/chat/` - Create/get chat
- `GET /api/chat/:userId` - Get user's chats
- `POST /api/chat/message/:chatId` - Add message to chat
- `GET /api/chat/message/:chatId` - Get chat messages

### Status
- `POST /api/status/` - Create status
- `GET /api/status/:userId` - Get user status

---

## 🧪 Technologies Used

| Category           | Technology              |
| ------------------ | ----------------------- |
| Frontend Framework | React 19 + Vite         |
| Styling            | Tailwind CSS 4, DaisyUI |
| State Management   | Zustand                 |
| Forms              | React Hook Form + Yup   |
| HTTP Client        | Axios                   |
| Real-time          | Socket.io Client        |
| Backend Framework  | Express.js 5            |
| Database           | MongoDB + Mongoose      |
| Authentication     | JWT                     |
| File Upload        | Multer + Cloudinary     |
| Email              | Nodemailer              |
| SMS/Video          | Twilio                  |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Dharmeshp1582**
- GitHub: [Dharmeshp1582](https://github.com/Dharmeshp1582)

---

## ⭐ Show your support

If you found this project helpful, please give it a ⭐️ on GitHub!

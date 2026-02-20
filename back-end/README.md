# FreeTalk Backend: API & Real-Time Documentation

This is the backend for FreeTalk, a Node.js/Express server providing real-time messaging, room management, and WebRTC signaling for the FreeTalk platform.

---

## 🛠️ Tech Stack
- **Node.js**: Runtime environment.
- **Express.js**: Web framework.
- **MongoDB & Mongoose**: Database and ODM.
- **Socket.io**: WebSockets for real-time communication.
- **JWT**: For secure authenticated routes.

---

## 🔑 Environment Variables
Configure these in a `.env` file in the `back-end/` root:

| Variable | Description |
| :--- | :--- |
| `PORT` | The port the server runs on (default: `5000`). |
| `MONGO_URI` | The connection string for your MongoDB instance. |
| `JWT_SECRET` | Secret key used for signing JWT tokens. |

---

## 🗄️ Database Models

### User
- `username` (String, required, unique)
- `email` (String, optional, unique)
- `password` (String, optional)
- `isAnonymous` (Boolean, default: `false`)
- `socketId` (String)

### Room
- `name` (String, required)
- `roomId` (String, unique, URL-safe)
- `isPublic` (Boolean, default: `true`)
- `owner` (ObjectId, ref: `User`)
- `participants` (Array, ref: `User`)
- `invitations` (Array, ref: `User`)

### Message
- `roomId` (ObjectId, ref: `Room`)
- `sender` (ObjectId, ref: `User`)
- `content` (String)
- `timestamps` (createdAt, updatedAt)

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create a new permanent account.
- `POST /api/auth/login` - Authenticate existing user.
- `GET /api/auth/me` - [Protected] Get current user profile.
- `PUT /api/auth/profile` - [Protected] Update profile details.

### Users (Anonymous)
- `POST /api/users` - Create a quick anonymous guest profile.
- `GET /api/users/:id` - Fetch user details.

### Rooms
- `GET /api/rooms` - [Protected] List available rooms.
- `GET /api/rooms/:id` - Get specific room metadata.
- `POST /api/rooms` - [Protected] Create a new room.
- `DELETE /api/rooms/:roomId` - [Protected] Delete room (Owner only).
- `POST /api/rooms/:roomId/join` - [Protected] Join a room.
- `POST /api/rooms/:roomId/invite` - [Protected] Invite a user to a private room.
- `GET /api/rooms/stats` - Get live counts of users per category.

### Messages
- `GET /api/messages/:roomId` - Retrieve message history for a room.
- `POST /api/messages` - Send a new message.

---

## 🔌 Socket Events

The server handles three primary real-time flows:

### 1. Registration & Core
- `register-user` (`{ userId, username }`): Syncs the socket ID with the user's database ID.
- `join_room` (`roomId`): Joins the socket to an Express room and triggers `room_user_count`.

### 2. Real-Time Messaging
- `send_message` (Client -> Server): Emitted by client after API persists the message.
- `receive_message` (Server -> Client): Broadcasted to all users in the specific room.

### 3. Video Call Signaling
- `video-call:request`: Notifies target peer of an incoming call.
- `video-call:accept` / `reject`: Handshake for P2P connection.
- `webrtc:signal`: Transmits SDP offers/answers and ICE candidates between peers.
- `video-call:hangup`: Clean up the call session.

---

## 🚀 Setup & Launch
1. Install dependencies: `npm install`
2. Start in dev mode: `npm run dev`
3. Production: `node index.js`

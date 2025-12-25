# Free Talk – Anonymous Mental-Health Chat

A **real-time-ready, anonymous chat platform** designed for mental-health support.  
Users can join chat rooms without creating an account, stay anonymous, and connect with others in a safe environment.

---

## 🌟 Features

- **Anonymous Chat** – Users can choose a display name without signing up.
- **Room-based Chat** – Each chat room has a unique URL (`/talk/general`, `/talk/stress`, etc.).
- **Dark Mode** – Designed with a calm, mental-health-friendly dark theme.
- **Optimistic UI** – Messages appear instantly; ready for real-time integration.
- **Modular Architecture** – Components and hooks separated for clean, maintainable code.
- **Accessible Design** – Keyboard navigation, aria-labels, focus states, and readable contrast.
- **Portfolio-ready** – Easy to deploy and showcase on GitHub.

---

## 🏗️ Architecture


### 🔹 Hooks

- `useUsername` – Handles anonymous username storage in `localStorage`.
- `useMessages` – Manages messages per room (ready for Socket.io integration).

### 🔹 Components

- `ChatHeader` – Displays room name.
- `MessageList` – Shows messages with username and self/other alignment.
- `MessageInput` – Input + send button with keyboard support.
- `UsernameModal` – Modal for entering anonymous name.

---

## 🎨 UI / Screenshots

**Landing / Default Room**  
![Screenshot](./screenshots/default-room.png)

**Username Modal**  
![Screenshot](./screenshots/username-modal.png)

**Chat Messages**  
![Screenshot](./screenshots/chat-messages.png)

> Replace these placeholders with actual screenshots from your app.

---

## 💻 Technologies

- **Next.js 13 (App Router)** – Client + Server components  
- **TypeScript** – Strongly typed hooks and components  
- **Tailwind CSS** – Dark mode, responsive design, UX polish  
- **React Hooks** – Modular state management  
- **Optional Socket.io** – Architecture ready for real-time chat

---

## ⚡ Future Improvements

- **Real-Time Messaging** – Integrate Socket.io backend.  
- **Message Persistence** – Save messages per room in database.  
- **Room List / Navigation** – Easily switch or create rooms.  
- **Moderation Tools** – For safe chat experience.  
- **Deployment** – Vercel or Railway for live demo.  

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/free-talk.git
cd free-talk
npm install
npm run dev
Open http://localhost:3000/talk
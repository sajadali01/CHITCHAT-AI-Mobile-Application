<div align="center">

# 💬 ChitChatAI
**Real-time Group-Based AI Chatbot Mobile Application with Context-Aware Conversations**

### Built with:

<img src="https://img.shields.io/badge/React%20Native-61DAFB.svg?style=flat&logo=react&logoColor=black">
<img src="https://img.shields.io/badge/Expo-000020.svg?style=flat&logo=expo&logoColor=white">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white">
<img src="https://img.shields.io/badge/NativeWind-38B2AC.svg?style=flat">
<img src="https://img.shields.io/badge/Lucide_Icons-000000.svg?style=flat">
<br>
<img src="https://img.shields.io/badge/Node.js-339933.svg?style=flat&logo=node.js&logoColor=white">
<img src="https://img.shields.io/badge/MongoDB-47A248.svg?style=flat&logo=mongodb&logoColor=white">
<img src="https://img.shields.io/badge/Firebase-FFCA28.svg?style=flat&logo=firebase&logoColor=black">
<img src="https://img.shields.io/badge/Socket.IO-010101.svg?style=flat&logo=socketdotio&logoColor=white">
<br>
<img src="https://img.shields.io/badge/SecureStore-FFA500.svg?style=flat">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white">

</div>

## 📖 Overview

**ChitChatAI** is a real-time group-based chat application that integrates an **AI assistant directly inside conversations**. It is designed for teams, communities, classrooms, and friends to collaborate with ease.

Users can:
- Chat in real-time.
- Create and manage groups.
- Interact with AI using `@AI <message>`.
- Generate summaries using `@AI summary n`.
- Forward, pin, reply, clear messages, and more.

The system is built using:
- **React Native (Expo)** for cross-platform mobile UI  
- **Node.js + MongoDB** for backend scalability  
- **Firebase** for authentication  
- **Socket.IO** for instant communication  

---

### ✨ Key Features

- Secure JWT-based authentication  
- Real-time group chat using Socket.IO  
- AI assistant inside each group  
- Generate summaries of last *n* days  
- Reply to specific messages  
- Forward messages to any group  
- Pin and unpin messages  
- Clear all messages or clear own messages  
- Beautiful and responsive UI with NativeWind  

---

## 📦 Installation

1. Clone the Repository

      git clone ThisRepoLink

      Open the project folder in your code editor.

2. Open Three Terminals

    Inside the project root, open three terminals:

    Backend terminal → /backend

    Frontend terminal → /frontend

    Main/root terminal → project root (optional for utility commands)

3. Install Node Dependencies

      In both the backend and frontend terminals, run:

    npm install

4. Install Backend Dependencies (Root Folder)

    In the root terminal, install the required backend libraries:

    Command : npm install mongoose express

5. Add Required Firebase & Environment Files

    You must request the following files from the project owner:

    firebaseServiceKey.json and .env

    Place both files inside the /backend folder.

⚠️ The backend will not run without these files.

6. Start the Backend

    In the backend terminal, run:

    npm run dev

    This starts the Node.js + Express + Socket.io backend.

7. Start the Frontend

    In the frontend terminal, run:

    npx expo start

Scan the QR code with Expo Go to run the app on your device.

🎉 You're All Set!

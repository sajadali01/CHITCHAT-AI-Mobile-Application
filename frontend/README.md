# ChitChatAI
ChitChat AI, a real-time group-based AI chatbot mobile application that allows multiple users to interact with an AI assistant within a shared conversation interface.


This commit finalizes the frontend development of the Chit Chat AI app using React Native + Expo.

✨ Features Implemented:
- Full authentication flow (Signup, Login, Logout with custom modals)
- Chat List screen with group create/delete/pin functionality
- Group Chat screen with dynamic messaging UI (right/left bubble logic, AI assistant, typing status)
- Chat Bubble component supports user-based alignment and theming
- Profile screen with:
  - Notification settings
  - Dark/Light mode toggle
  - Invite & Logout functionality
- Custom modals for Logout & Delete actions (replacing native Alert with theme-support)
- ThemeContext for full light/dark theme support across all screens
- Fully responsive UI with proper KeyboardAvoidingView handling

🔧 Tech Stack:
- React Native (with Expo)
- TypeScript
- Tailwind CSS (via NativeWind)
- Lucide Icons
- SecureStore for settings
- FlatList & ScrollView for performance and scroll handling

💄 UX Enhancements:
- Custom confirmation modals for better design consistency
- Animated floating buttons
- Proper empty state placeholders
- Responsive form inputs with inline validation
- All screens styled for both light & dark mode

📁 Project Scope:
Frontend only — API connections via mock services (`@/services/api.ts`) and OpenAI stub.

🛠 Next Steps:
- Integrate with live backend
- Add real-time socket support for live chat updates
- Implement user avatars and media support in chats

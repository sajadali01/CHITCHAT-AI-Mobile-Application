const express = require('express');
const cors = require('cors');
const http = require('http');
const onlineUsers = new Map(); // userId -> socketId
require('dotenv').config();
const { initializeSocket } = require('./utils/socket');

const connectDB = require('./config/db');
const authenticateUser = require('./middleware/firebaseAuth');

// Import routes
const groupRoutes = require('./routes/groupRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ====================
// ⚙️ Connect to MongoDB
// ====================
connectDB();

// ====================
// 📦 Initialize App & Server
// ====================
const app = express();
const server = http.createServer(app);

// ====================
// 📡 Socket.IO setup
// ====================
const io = initializeSocket(server);

// ====================
// 🛡 Middleware
// ====================
app.use(cors());
app.use(express.json());

// ====================
// 📦 API ROUTES
// ====================
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groups', groupRoutes);


// ====================
// 💬 SOCKET.IO EVENTS
// ====================
const ChatMessage = require('./models/ChatMessage');

io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  socket.on('userConnected', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} is online`);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`👥 User joined group: ${groupId}`);
  });

  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    console.log(`👋 User left group: ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} went offline`);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });
});





// ====================
// 🧪 Test Route
// ====================
app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});


app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is working!' });
});

// ====================
// 🤖 Test AI Route
// ====================
app.get('/api/test-ai', async (req, res) => {
  try {
    const { chatWithGroq } = require('./aiService');
    const testResponse = await chatWithGroq([
      { role: 'user', content: 'Hello, can you respond to this test message?' }
    ]);
    res.json({ 
      message: '✅ AI Test', 
      response: testResponse,
      apiKeySet: !!process.env.GROQ_API_KEY 
    });
  } catch (error) {
    res.json({ 
      message: '❌ AI Test Failed', 
      error: error.message,
      apiKeySet: !!process.env.GROQ_API_KEY 
    });
  }
});

// ====================
// 📄 Swagger Docs
// ====================
const swaggerDocs = require('./swagger');
swaggerDocs(app);

// ====================
// 🚀 Start Server
// ====================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://musical-khapse-5244f7.netlify.app'
      : ['http://localhost:5173', 'https://musical-khapse-5244f7.netlify.app'],
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://musical-khapse-5244f7.netlify.app'
    : ['http://localhost:5173', 'https://musical-khapse-5244f7.netlify.app']
}));

// Function to get all users in a room
const getUsersInRoom = (room) => {
  const users = [];
  const sockets = io.sockets.adapter.rooms.get(room);
  if (sockets) {
    for (const socketId of sockets) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.data.name) {
        users.push({ id: socketId, name: socket.data.name });
      }
    }
  }
  return users;
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('join room', (data) => {
    const { uuid, name } = data;
    socket.join(uuid);
    socket.data.name = name; // Store the user's name
    console.log(`${name} (${socket.id}) joined room ${uuid}`);
    
    // Get all users in the room
    const users = getUsersInRoom(uuid);

    // Notify all users in the room (including the new user) about the updated user list
    io.in(uuid).emit('room users', users);

    // Notify other users that a new user has joined
    socket.to(uuid).emit('user joined', { id: socket.id, name });
  });

  socket.on('new input', (data) => {
    const { uuid, code } = data;
    console.log(`New input received for room ${uuid}`);
    socket.to(uuid).emit('input received', code);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
    // Notify rooms that the user left
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        io.in(room).emit('user left', { id: socket.id, name: socket.data.name });
        // Send updated user list to remaining users
        const users = getUsersInRoom(room);
        io.in(room).emit('room users', users);
      }
    });
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Add error handling for the HTTP server
httpServer.on('error', (error) => {
  console.error('HTTP Server error:', error);
});
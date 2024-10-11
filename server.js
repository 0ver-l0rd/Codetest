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

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('join room', (data) => {
    const { uuid, name } = data;
    socket.join(uuid);
    console.log(`${name} (${socket.id}) joined room ${uuid}`);
    
    // Notify other users in the room
    socket.to(uuid).emit('user joined', { name });
    
    // Send the current users in the room to the newly joined user
    const users = Array.from(io.sockets.adapter.rooms.get(uuid) || []).map(socketId => {
      return io.sockets.sockets.get(socketId).data.name;
    });
    console.log(`Users in room ${uuid}:`, users);
    socket.emit('room users', users);
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
        socket.to(room).emit('user left', socket.data.name);
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
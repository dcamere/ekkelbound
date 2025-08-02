const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('../public/')); // Carpeta donde estará tu juego frontend

let rooms = {};

io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    // Envía el estado inicial al jugador
    socket.emit('gameState', rooms[roomId] || {});
  });

  socket.on('playerAction', ({ roomId, action }) => {
    // Actualiza el estado y lo transmite a todos
    // rooms[roomId] = ...actualiza según acción...
    io.to(roomId).emit('gameState', rooms[roomId]);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor listo en puerto', PORT));
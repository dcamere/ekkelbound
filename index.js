const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const path = require('path');
app.use(express.static(path.join(__dirname, './'))); // Sirve archivos estáticos desde la raíz

let gameState = {
  players: [], // {id, x, vida, angulo, ...}
  enemy: { x: 200, vida: 100, angulo: 45 },
  turno: 0 // índice del jugador que tiene el turno
};

io.on('connection', (socket) => {
  // Crea el jugador al entrar
  const newPlayer = {
    id: socket.id,
    x: Math.floor(Math.random() * 100) + 10,
    vida: 100,
    angulo: 45,
    potencia: 50,
    flip: false
  };
  gameState.players.push(newPlayer);
  io.emit('gameState', gameState);

  // Maneja acciones de los jugadores
  socket.on('playerAction', (action) => {
    // Solo procesa si es el turno del jugador
    if (gameState.players[gameState.turno] && gameState.players[gameState.turno].id === socket.id) {
      // Actualiza el jugador correspondiente
      let player = gameState.players.find(p => p.id === socket.id);
      if (player) {
        Object.assign(player, action); // action: {x, angulo, potencia, flip, ...}
      }
      // Avanza el turno
      gameState.turno++;
      if (gameState.turno >= gameState.players.length) {
        // Turno del enemigo
        // Simula acción del enemigo (ejemplo: daño a un jugador random)
        const target = gameState.players[Math.floor(Math.random() * gameState.players.length)];
        if (target) target.vida = Math.max(0, target.vida - 30);
        gameState.turno = 0;
      }
      io.emit('gameState', gameState);
    }
  });

  // Elimina al jugador al desconectarse
  socket.on('disconnect', () => {
    gameState.players = gameState.players.filter(p => p.id !== socket.id);
    // Si el turno era de este jugador, ajusta el turno
    if (gameState.players.length === 0) {
      gameState.turno = 0;
    } else if (gameState.turno >= gameState.players.length) {
      gameState.turno = 0;
    }
    io.emit('gameState', gameState);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Servidor listo en puerto', PORT));
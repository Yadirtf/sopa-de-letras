import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
import { app } from './app';
import { prisma } from './lib/prisma';
import { setupRoomSocketHandlers } from './modules/rooms/room.socket';
import { setupGameSocketHandlers } from './modules/game/game.socket';

const PORT = process.env.API_PORT || 3001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Setup socket handlers
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  
  setupRoomSocketHandlers(io, socket);
  setupGameSocketHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Conectado a la base de datos');
    
    server.listen(PORT, () => {
      console.log(`Servidor API escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

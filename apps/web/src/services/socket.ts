import { io, Socket } from 'socket.io-client';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('auth_token');
    const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || undefined;
    
    const socketOptions = {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'] as ('websocket' | 'polling')[],
    };

    this.socket = wsUrl ? io(wsUrl, socketOptions) : io(socketOptions);
    
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();

import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

interface Player {
  id: string;
  nickname: string;
  found: number;
  total: number;
}

export function useSocket(roomCode?: string) {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [gameStartedData, setGameStartedData] = useState<any>(null);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [roomError, setRoomError] = useState<string>('');

  useEffect(() => {
    socketService.connect();
    const socket = socketService.getSocket();

    if (!socket) return;

    const getJoinPayload = () => {
      return { 
        roomCode, 
        code: roomCode, 
        userId: user?.id, 
        nickname: user?.nickname || 'Invitado' 
      };
    };

    socket.on('connect', () => {
      setIsConnected(true);
      if (roomCode && user) {
        socket.emit('join_room', getJoinPayload());
      }
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('room_error', (data: { message?: string }) => {
      if (data?.message) {
        setRoomError(data.message);
      }
    });

    socket.on('player_joined', (data: Player | Player[]) => {
      if (Array.isArray(data)) {
        setPlayers(data);
      } else {
        setPlayers(prev => [...prev.filter(p => p.id !== data.id), data]);
      }
    });

    socket.on('player_left', (data: string | Player[]) => {
      if (Array.isArray(data)) {
        setPlayers(data);
      } else {
        setPlayers(prev => prev.filter(p => p.id !== data));
      }
    });

    socket.on('game_started', (data: any) => {
      setRoomStatus('playing');
      setGameStartedData(data);
    });

    socket.on('opponent_progress', (data: { id: string; found: number; total: number; nickname?: string }) => {
      setPlayers(prev => {
        const exists = prev.some(p => p.id === data.id || (data.nickname && p.nickname === data.nickname));
        if (exists) {
          return prev.map(p => (p.id === data.id || (data.nickname && p.nickname === data.nickname))
            ? { ...p, found: data.found, total: data.total }
            : p
          );
        }
        return [...prev, { id: data.id, nickname: data.nickname || 'Rival', found: data.found, total: data.total }];
      });
    });
    
    socket.on('game_finished', (data: any) => {
      setRoomStatus('finished');
      setWinnerData(data);
      if (data.standings && Array.isArray(data.standings)) {
        setPlayers(data.standings);
      }
    });

    if (roomCode && user && socket.connected) {
      socket.emit('join_room', getJoinPayload());
    }

    return () => {
      if (roomCode) {
        socket.emit('leave_room', { roomCode, code: roomCode, userId: user?.id });
      }
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_error');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('opponent_progress');
      socket.off('game_finished');
    };
  }, [roomCode, user?.id, user?.nickname]);

  const emit = useCallback((event: string, data?: any) => {
    socketService.getSocket()?.emit(event, data);
  }, []);

  return { isConnected, players, roomStatus, gameStartedData, winnerData, setWinnerData, roomError, setRoomError, emit };
}

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

// replace with your backend URL / IP
const socket = io('http://10.138.62.96:5000', { transports: ['websocket'] });

export default function useOnlineUsers(currentUserId: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (currentUserId) {
      socket.emit('userConnected', currentUserId);
    }

    socket.on('onlineUsers', (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off('onlineUsers');
    };
  }, [currentUserId]);

  return { onlineUsers, socket };
}

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../utils/api.js';

// Hidden WebSocket flag
export function WebSocketFlag() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const socket = io(API_URL, {
        transports: ['websocket'],
        withCredentials: true
      });

      socket.on('connect', () => {
        // Request secret message
        socket.emit('get:secret');
      });

      socket.on('secret:message', (data) => {
        console.log('WebSocket secret:', data);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  return null;
}


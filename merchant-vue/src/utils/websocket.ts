import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';

// Initialize socket
export const initWebSocket = (url: any) => {
  if (import.meta.env.VITE_APP_WEBSOCKET === 'false') {
    return;
  }
  url = url + '?Authorization=Bearer ' + getToken() + '&clientId=' + import.meta.env.VITE_APP_CLIENT_ID;
  useWebSocket(url, {
    autoReconnect: {
      // Maximum reconnect attempts
      retries: 3,
      // Reconnect interval
      delay: 1000,
      onFailed() {
        console.log('WebSocket reconnection failed');
      }
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping' }),
      // Heartbeat interval
      interval: 10000,
      // Timeout for receiving heartbeat response
      pongTimeout: 2000
    },
    onConnected() {
      console.log('websocket already connected');
    },
    onDisconnected() {
      console.log('WebSocket disconnected');
    },
    onMessage: (_, e) => {
      if (e.data.indexOf('ping') > 0) {
        return;
      }
      useNoticeStore().addNotice({
        message: e.data,
        read: false,
        time: new Date().toLocaleString()
      });
      ElNotification({
        title: 'Message',
        message: e.data,
        type: 'success',
        duration: 3000
      });
    }
  });
};

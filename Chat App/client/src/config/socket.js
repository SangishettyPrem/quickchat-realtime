// config/socket.js
import { io } from 'socket.io-client';

const getSocketURL = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    } else {
        // Use your network IP for mobile access
        return 'http://192.168.1.3:8080';
    }
};

const socket = io(getSocketURL(), {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

export default socket;
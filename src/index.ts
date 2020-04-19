import express from 'express';
import socketio from 'socket.io';
import http from 'http';

import { getUserChannel, removeUserChannel, setUserChannel } from './utils';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

interface SocketMessage {
    event: string;
    socketId?: string;
    data: string | { socketId?: string; [key: string]: unknown };
    [key: string]: unknown;
}

const createSendToChannel = (socket: socketio.Socket) => (channel: string, event: string, message: SocketMessage) => {
    console.log(`Sending to #${channel}, [${event}]: ${JSON.stringify(message)} (${socket.id})`);

    // socket.in(channel).emit(event, message);
    const messageWithSocketId = message;

    if (messageWithSocketId.data && typeof messageWithSocketId.data === 'object') {
        messageWithSocketId.data.socketId = socket.id;
    } else {
        messageWithSocketId.socketId = socket.id;
    }

    io.in(channel).emit(event, messageWithSocketId);
};

app.use('/', express.static('./public'));

io.on('connection', (socket) => {
    const socketId = socket.id;
    const sendToChannel = createSendToChannel(socket);

    socket.on('disconnect', (_reason) => {
        const channel = getUserChannel(socketId);

        sendToChannel(channel, 'message', {
            event: 'leave-channel',
            data: {
                socketId,
            },
        });

        removeUserChannel(socketId);
    });

    socket.on('join-channel', (receivedData) => {
        const data = typeof receivedData === 'object' ? receivedData : { channel: receivedData, userName: socket.id };

        const { channel, userName } = data;

        socket.join(channel, (error) => {
            console.log(`# User ${userName || socket.id} joined #${channel}`);

            setUserChannel(socketId, channel, userName);

            sendToChannel(channel, 'message', {
                event: 'join-channel',
                data: {
                    socketId,
                    ...data,
                },
                error,
            });
        });
    });

    socket.on('message', (message) => {
        const channel = getUserChannel(socketId);

        try {
            sendToChannel(channel, 'message', JSON.parse(message));
        } catch (error) {
            sendToChannel(channel, 'message', message);
        }
    });
});

const { PORT = 8080 } = process.env;

server.listen(PORT, () => console.warn(`server :${PORT}`));

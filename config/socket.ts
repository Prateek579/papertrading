import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
    if (socket) {
        return socket;
    }
    socket = io(process.env.NEXT_PUBLIC_APP_URL as string, {
        path: "/socket.io",
        autoConnect: false,
    });
    return socket;
};
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV != "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    // console.log("client connected");

    socket.on("stock-subscribe", (stockName) => {
      // console.log("stock name", stockName);

      if (!socket.rooms.has(stockName)) {
        socket.join(stockName);
        const interval = setInterval(async () => {
          const data = Math.floor(Math.random() * 1000);
          // console.log("data", data);
          const room = io.sockets.adapter.rooms.get(stockName);
          if (room && room.size > 0) {
            io.to(stockName).emit("stock-update", {
              stockName: stockName,
              stockPrice: data,
            });
          } else {
            clearInterval(interval);
          }
        }, [2000]);
      } else {
        console.log("user is already in room ", stockName);
      }
      socket.on("leave-room", (roomName) => {
        socket.leave(roomName);
        // console.log("leaving room....", roomName);
      });
      socket.on("disconnect", () => {
        clearInterval(interval);
        // console.log(`Client disconnected from ${stockName}`);
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("socket.io error", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
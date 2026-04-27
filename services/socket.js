let io;

exports.initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://stock-tarding-app-fe.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
  return io;
};

exports.getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

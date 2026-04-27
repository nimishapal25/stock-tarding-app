let io;

exports.initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });
  return io;
};

exports.getIo = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const express = require("express");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./services/socket");

// ✅ 1. create app
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stock-tarding-app-fe.onrender.com",
    ],
    credentials: true,
  }),
);

// ✅ 2. create HTTP server
const server = http.createServer(app);
initSocket(server);

// This defines a "route" for the home page
app.get("/", (req, res) => {
  res.send("Hello, Express is running!");
});

//signup route
app.use("/api/v1/users", userRouter);

app.use(globalErrorHandler);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
); //connect to atlas
const LOCAL_DB = process.env.DATABASE_LOCAL; // connet to local DB

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connected successfully");
    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));

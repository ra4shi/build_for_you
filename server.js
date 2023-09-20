const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const localadminController = require('./Controller/localadminController');

 

// Environment config
require('dotenv').config();

// DB import
const config = require('./config/dbConfig');
const mongoURI = config.mongoURI;

// Connect to MongoDB with options
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Setup CORS
app.use(cors());

// Parse JSON and URL-encoded data with increased limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Define routes
const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoute");
const localadminRoute = require('./routes/localadminRoute');
// app.use('/public', express.static('./public/project_images'));
app.use('/public', express.static('./public/project_images'));
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/localadmin", localadminRoute);

// Create HTTP server and set up Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const port = process.env.PORT || 5000;

io.on("connect", (socket) => {
  console.log("User connected:");
  socket.on("join-room", (data) => {
    socket.join(data);
    console.log(`user with id: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", async (data) => {
    io.to(data.room).emit("receive_message", data);
    const { room, author, message } = data;

    await localadminController.chatHistory(room, message, author);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

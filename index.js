const express = require("express");
const app = express();
const server = require("http").createServer(app);
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.resolve("client", "build")));

const PORT = process.env.PORT || 5000;

app.get("/check", (req, res) => {
  res.send("S. Running");
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve("client", "build", "index.html"));
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

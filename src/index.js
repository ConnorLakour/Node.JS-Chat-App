const express = require("express");
const path = require("path");
const port = process.env.PORT || 3000;
const http = require("http");
const socketIO = require("socket.io");
const Filter = require("bad-words");

const users = require("./utils/users");
const generateMessage = require("./utils/messages");
const generateLocationMessage = require("./utils/generateLocationMessages");

const publicDirPath = path.join(__dirname, "../public");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicDirPath));

io.on("connection", socket => {
  console.log("new websocket connection");

  // new user join
  //send message to all clients except current client
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  //send message to all clients
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    } else {
      //io sends message to all clients
      io.emit("message", generateMessage(message));
      //sends acknowledgement to client who sent that particular message
      callback();
    }
  });

  //receive location data
  socket.on("sendLocation", (data, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps?q=${data.latitude},${data.longitude}`
      )
    );
    callback("Location shared!");
  });

  //user left chat
  socket.on("disconnect", () => {
    const user = users.removeUser(socket.id);
    if (user) {
      io
        .to(user.room)
        .emit("message", generateMessage(`${user.username} has left the chat`));
    }
  });

  //get usrname and room name
  socket.on("join", data => {
    const user = users.addUser({
      id: socket.id,
      username: data.username,
      room: data.room
    });

    //send welcome message
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));

    //this will make so that a user can only send messages to their chat room
    socket.join(user.room);
  });
});

server.listen(port, () => {
  console.log("Server is running on port " + port);
});

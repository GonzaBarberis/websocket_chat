const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// const getRandomUser = async () => {
//   try {
//     const response = await fetch("https://random-data-api.com/api/v2/users");
//     const data = await response.json();
//     return `${data.first_name} ${data.last_name}`;
//   } catch (error) {
//     console.error("Error fetching random name:", error);
//     return "Anónimo";
//   }
// };

const getRandomUser = async () => {
  try {
    const response = await fetch("https://random-data-api.com/api/v2/users");
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return `${data.first_name} ${data.last_name}`;
    } else {
      console.warn("Respuesta no válida de la API:", await response.text());
      return "Anónimo";
    }
  } catch (error) {
    console.error("Error fetching random name:", error);
    return "Anónimo";
  }
};

io.on("connection", async (socket) => {
  let userName = await getRandomUser();

  io.emit("chat message", { userId: socket.id, type: "newconnection", userName: userName });

  socket.on("chat message", (msg) => {
    io.emit("chat message", { msg, userId: socket.id, userName: userName });
  });

  socket.on("disconnect", () => {
    io.emit("chat message", { userId: socket.id, type: "disconnection", userName: userName });
  });
});

server.listen(3900, () => {
  console.log("El servidor está corriendo en el puerto 3900 | http://localhost:3900");
});

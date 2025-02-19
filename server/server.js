require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { assignRoles, getGameData } = require("./gameLogic");
const connectDB = require("./db");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Store game rooms
const rooms = {};

// Handle WebSocket connections
wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "create-room") {
            const roomCode = Math.random().toString(36).substring(2, 7);
            rooms[roomCode] = { players: [], word: "", impostorIndex: null };
            ws.send(JSON.stringify({ type: "room-created", roomCode }));
        }

        if (data.type === "join-room") {
            const { roomCode, playerName } = data;
            if (!rooms[roomCode]) {
                ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                return;
            }
            rooms[roomCode].players.push({ name: playerName, ws });

            ws.send(JSON.stringify({ type: "joined", roomCode }));
        }

        if (data.type === "start-game") {
            const { roomCode, word } = data;
            if (!rooms[roomCode]) return;
            assignRoles(rooms[roomCode], word);

            rooms[roomCode].players.forEach((player, index) => {
                player.ws.send(
                    JSON.stringify({
                        type: "word-assigned",
                        word: rooms[roomCode].impostorIndex === index ? "You are the Impostor!" : word,
                    })
                );
            });
        }
    });

    ws.on("close", () => {
        // Cleanup when player leaves
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));

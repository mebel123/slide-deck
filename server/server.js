const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require("ws");
const Redis = require("ioredis");

const pub = new Redis({ host: "slide-deck_redis" });
const sub = new Redis({ host: "slide-deck_redis" });
const redis = new Redis({ host: "slide-deck_redis" });

const SESSION_TTL_SECONDS = 86400; // z.B. 24 Stunden

// Express Server Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/create-session', async (req, res) => {
    const sessionId = generateSessionId();
    await redis.set(`session:${sessionId}`, 'active', 'EX', SESSION_TTL_SECONDS);
    res.json({ sessionId });
});

app.listen(4000, () => {
    console.log("Session-HTTP-Server läuft auf Port 4000");
});

// Session-ID Generator
function generateSessionId() {
    return Math.random().toString(36).substr(2, 8);
}

// Dein bestehender WebSocket-Server
const wss = new WebSocket.Server({ port: 3000 });
console.log("WebSocket-Server läuft auf ws://localhost:3000");

sub.subscribe("poll-updates");
sub.on("message", (channel, message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(message);
    });
});

// WebSocket Logic
wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
        const data = JSON.parse(message);

        if (data.type === "poll-answer") {
            const { pollId, question, answer, clientId, sessionId } = data;

            // Prüfen, ob Session gültig
            const sessionExists = await redis.exists(`session:${sessionId}`);
            if (!sessionExists) {
                ws.send(JSON.stringify({ type: "error", message: "Ungültige Session!" }));
                return;
            }

            const pollVotesKey = `session:${sessionId}:poll:${pollId}:votes`;
            const pollClientKey = `session:${sessionId}:poll:${pollId}:clients`;

            const previousAnswer = await redis.hget(pollClientKey, clientId);

            if (previousAnswer === answer) {
                // await checkAllClientsVoted(sessionId, pollId, question);
                return;
            }

            if (previousAnswer) {
                await redis.hincrby(pollVotesKey, previousAnswer, -1);
            }

            await redis.hset(pollClientKey, clientId, answer);
            await redis.hincrby(pollVotesKey, answer, 1);

            const results = await redis.hgetall(pollVotesKey);

            const updateMessage = {
                type: "poll-update",
                pollId,
                question,
                results
            };

            pub.publish("poll-updates", JSON.stringify(updateMessage));

            await checkAllClientsVoted(sessionId, pollId, question);
        }
    });

    ws.on("close", () => {
        console.log("Client getrennt");
    });
});

async function checkAllClientsVoted(sessionId, pollId, question) {
    const pollClientKey = `session:${sessionId}:poll:${pollId}:clients`;
    const votedClientsCount = await redis.hlen(pollClientKey);
    const totalConnectedClients = Array.from(wss.clients).filter(c => c.readyState === WebSocket.OPEN).length;

    if (votedClientsCount === totalConnectedClients) {
        const allVotedMessage = {
            type: "poll-completed",
            pollId,
            question,
            message: "Alle Clients haben abgestimmt!"
        };

        pub.publish("poll-updates", JSON.stringify(allVotedMessage));
    }
}

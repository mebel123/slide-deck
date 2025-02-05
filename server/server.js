const WebSocket = require("ws");
const Redis = require("ioredis");

// Redis-Clients (Pub/Sub)
const pub = new Redis({ host: "redis" });
const sub = new Redis({ host: "redis" });

// WebSocket-Server auf Port 3000
const wss = new WebSocket.Server({ port: 3000 });

console.log("WebSocket-Server läuft auf ws://localhost:3000");

// Abonniere den Channel "chat"
sub.subscribe("chat");

wss.on("connection", (ws) => {
    console.log("Neuer Client verbunden");

    // Weiterleiten von Redis-Nachrichten an WebSocket-Clients
    sub.on("message", (channel, message) => {
        if (channel === "chat") {
            ws.send(message);
        }
    });

    // Empfangene Nachrichten an Redis-Pub-Sub weiterleiten
    ws.on("message", (message) => {
        console.log("Empfangene Nachricht:", message);
        pub.publish("chat", message);
    });

    // Schließen der Verbindung
    ws.on("close", () => {
        console.log("Client getrennt");
    });
});

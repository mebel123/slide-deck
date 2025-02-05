let ws = null;

export function initWebSocket() {
    ws = new WebSocket("ws://127.0.0.1:3000");
    ws.onmessage = (event) => {
        console.log("Received message", event.data);

    };

}
export function sendEvent(data) {
    if (!data) {
        data = {}
    }
    ws.send(JSON.stringify(data));
}
export function sendMessage(data) {
    if (!data) {
        data = {}
    }
    if (data) {
        data.type = "message";
    }
    ws.send(JSON.stringify(data));
}


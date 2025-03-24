import {fireworks} from "./effects";

let ws = null;
const CLIENT_ID = localStorage.getItem('clientId') || generateClientId();
localStorage.setItem('clientId', CLIENT_ID);

function getSessionId() {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('session')) {
        alert("Keine Session-ID in der URL angegeben!");
        return "";
    }
    return params.get('session');
}
function generateClientId() {
    return 'client-' + Math.random().toString(36).substr(2, 9);
}
const pollCharts = {};

function handlePollUpdate(pollId, question, results) {
    console.log("Poll Update:", pollId, question, results);
    renderPollChart(pollId, question, results);
}
function renderPollChart(pollId, question, results) {
    let canvasId = `chart-${pollId}`;
    let canvas = document.getElementById(canvasId);

    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = canvasId;
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(results);
    const data = Object.values(results).map(Number);

    if (pollCharts[pollId]) {
        pollCharts[pollId].data.labels = labels;
        pollCharts[pollId].data.datasets[0].data = data;
        pollCharts[pollId].update();
    } else {
        pollCharts[pollId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: question,
                    data,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, precision: 0 } }
            }
        });
    }
}

export function initWebSocket() {
    ws = new WebSocket("ws://127.0.0.1:3000");
    ws.onmessage = (event) => {
        console.log("Received message", event.data);
        const data = JSON.parse(event.data);

        if (data.type === "poll-update") {
            handlePollUpdate(data.pollId, data.question, data.results);
        }

        if (data.type === "poll-completed") {
            handlePollCompleted(data.pollId, data.question);
        }
    };
}


function handlePollCompleted(pollId, question) {
    console.log(`Umfrage "${question}" (${pollId}) ist abgeschlossen. Alle haben abgestimmt!`);
    fireworks();
}
export function sendEvent(data) {
    if (!data) {
        data = {}
    }
    ws.send(JSON.stringify(data));
}
export function sendPollAnswer(pollId,question, answer) {
    const sessionId = getSessionId();
    const data = {
        type: "poll-answer",
        pollId,
        question,
        answer,
        clientId: CLIENT_ID,
        sessionId
    };
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


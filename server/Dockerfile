# Verwende ein leichtgewichtiges Node.js-Image
FROM node:18-alpine

# Setze das Arbeitsverzeichnis
WORKDIR /app

# Kopiere die package.json und installiere Abhängigkeiten
COPY package.json package-lock.json ./
RUN npm install

# Kopiere den restlichen Code
COPY . .

# Exponiere den WebSocket-Port
EXPOSE 3000
EXPOSE 4000

# Starte den WebSocket-Server
CMD ["node", "server.js"]

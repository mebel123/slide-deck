# 1. Schritt: Webpack-Client mit Node.js bauen
FROM node:18-alpine AS build

WORKDIR /app

# Kopiere package.json und installiere Dependencies
COPY package.json package-lock.json ./
RUN npm install

# Kopiere den Code und baue die Web-App mit Webpack
COPY . .
RUN npm run build

# 2. Schritt: Nginx als Webserver für das fertige Build verwenden
FROM nginx:alpine

# Kopiere das gebaute Webpack-Frontend in den Nginx-Ordner
COPY --from=build /app/dist /usr/share/nginx/html

# Exponiere den HTTP-Port
EXPOSE 80

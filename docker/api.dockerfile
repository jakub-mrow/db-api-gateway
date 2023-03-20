FROM node:18-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src .

EXPOSE 8080

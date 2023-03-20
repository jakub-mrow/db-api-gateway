FROM node:18-alpine

# Create app directory
WORKDIR /code

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

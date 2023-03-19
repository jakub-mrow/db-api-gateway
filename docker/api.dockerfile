FROM node:18

# Create app directory
WORKDIR /code

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

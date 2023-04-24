FROM node:18-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD [ "npm", "run", "start:dev" ]

EXPOSE 8080

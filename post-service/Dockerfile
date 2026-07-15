# Use the official Node.js 26 Alpine image
FROM node:26-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]

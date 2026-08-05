FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY index.html ./
COPY login.html ./
COPY register.html ./
COPY styles.css ./
COPY script.js ./
COPY auth.js ./

EXPOSE 3000

CMD ["node", "server.js"]

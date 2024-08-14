FROM node:20.16-alpine3.19

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY ecosystem.config.js .
COPY tsconfig.json .
COPY .env.production .
COPY twitter-swagger.yaml .
COPY ./src ./src

RUN apk add python3
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 3001

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]




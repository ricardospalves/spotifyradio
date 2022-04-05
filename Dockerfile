FROM node:17-slim

RUN apt update \
  && apt install -y sox libsox-fmt-mp3

WORKDIR /spotify-radio/

COPY package.json package-lock.json /spotify-radio/

RUN npm ci --silent

COPY . .

USER node

CMD npm run live-reload

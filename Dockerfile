FROM node:0.12.4

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm config set production && npm install
COPY dist /usr/src/app

EXPOSE 3001

CMD [ "npm", "start" ]

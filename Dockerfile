FROM node:0.10-onbuild

RUN apt-get update

RUN apt-get install -y npm
RUN npm install -g bower

ADD . /app

RUN npm install --production
RUN bower install --allow-root

EXPOSE 3001

CMD node server.js

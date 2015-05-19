FROM node:0.12-onbuild

RUN apt-get update

COPY . /app

EXPOSE 3001

CMD ["node", "./app/server.js"]

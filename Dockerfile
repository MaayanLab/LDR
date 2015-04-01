FROM library/node:0.10

RUN apt-get update && apt-get install -y npm

RUN npm install -g bower

WORKDIR /home

COPY *.js* ./
COPY app ./app
COPY config ./config
COPY app ./node_modules
COPY public ./public

RUN npm install

#RUN yes 1 | bower install --allow-root

EXPOSE 3001

CMD /bin/bash -c "node server.js"

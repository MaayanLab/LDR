FROM node:latest

ENV SOURCE_DIR /usr/src

RUN mkdir -p $SOURCE_DIR
RUN mkdir -p $SOURCE_DIR/app
WORKDIR $SOURCE_DIR

COPY package.json $SOURCE_DIR/
COPY bower.json $SOURCE_DIR/
COPY .bowerrc $SOURCE_DIR/

RUN npm install && \
    npm config set production

COPY app $SOURCE_DIR/app
COPY server.js $SOURCE_DIR/
COPY gulpfile.js $SOURCE_DIR/

RUN npm install -g gulp && \
    gulp build && \
    npm uninstall -g gulp && \
    npm prune && \
    rm -rf $SOURCE_DIR/app && \
    rm -rf $SOURCE_DIR/bower.json && \
    rm -rf $SOURCE_DIR/.bowerrc && \
    rm -rf $SOURCE_DIR/server.js && \
    rm -rf $SOURCE_DIR/gulpfile.js

EXPOSE 3001

CMD [ "npm", "start" ]

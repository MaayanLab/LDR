FROM node:4.2.6

# Set SOURCE_DIR variable, make the directory, and set it as work directory
ENV SOURCE_DIR /usr/src
RUN mkdir -p $SOURCE_DIR && cd $SOURCE_DIR
WORKDIR $SOURCE_DIR

# Copy dependencies to save time installing.
COPY node_modules $SOURCE_DIR/node_modules
COPY vendor $SOURCE_DIR/vendor

# Copy files needed for npm and bower
COPY package.json $SOURCE_DIR/
COPY bower.json $SOURCE_DIR/
COPY .bowerrc $SOURCE_DIR/

#############################################################
#### Although RUN commands are better when run together, ####
#### these were split up so that docker could cache the  ####
#### installed dependencies from npm and bower.          ####
#############################################################

# 1. Install all npm dependencies (including dev dependencies)
# 2. Set NODE_ENV=production
# 3. Globally install gulp and bower
# 4. Install bower dependencies
#    (--allow-root needed because user in container is root)
RUN npm install && \
    npm config set production && \
    npm install -g gulp bower && \
    bower install --allow-root

# These are copied after the run commands so that the container is
# more likely to be the same up until this point. Because docker
# compares containers, the previous RUN command won't be cached if
# these are copied before.
COPY app $SOURCE_DIR/app
COPY server.js $SOURCE_DIR/
COPY gulpfile.js $SOURCE_DIR/

# 1. Build dist/ folder with built application using gulp
#    Set --production flag to minimize js files.
# 2. Uninstall gulp and bower globally (only needed for build)
# 3. Because NODE_ENV=production, npm prune will remove all
#    dev dependencies. These were only needed for 'gulp build'
# 4-9. Only files needed to run application are the package.json and
#      everything in the dist/ folder. Remove everything else.
RUN gulp build --production && \
    npm uninstall -g gulp bower && \
    npm prune && \
    rm -rf $SOURCE_DIR/app && \
    rm -rf $SOURCE_DIR/vendor && \
    rm -rf $SOURCE_DIR/bower.json && \
    rm -rf $SOURCE_DIR/.bowerrc && \
    rm -rf $SOURCE_DIR/server.js && \
    rm -rf $SOURCE_DIR/gulpfile.js

# Application is run on port 3001.
EXPOSE 3001

# 'npm start' will run the start script in the package.json. This command is
# currently 'node dist/server.js'
CMD [ "npm", "start" ]

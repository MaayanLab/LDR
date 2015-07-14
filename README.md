# LDR #
LINCS Data Registry Webpage

## Develop ##
Note that gulp is required to build: `npm install -g gulp`
```
npm install && bower install
gulp
```

## Test ##
After installing, run `karma start` or `gulp karma` to run karma tests

## Deploy ##
This application is deployed using [Docker](https://www.docker.com/ "Docker Homepage"), [Mesos](http://mesos.apache.org/ "Mesos Homepage"), and [Marathon](https://mesosphere.github.io/marathon/ "Mesos Homepage").

Running `VERSION=x.x.x npm run build` will build the container using the Dockerfile found in the root folder using the tag **146.203.54.165:5000/ldr:x.x.x** and **146.203.54.165:5000/ldr:latest**.

The Dockerfile will perform the following actions:

- `gulp build` to build the production-ready folder
- Copy that folder into the container
- Set `NODE_ENV=production`
- Run `npm install`
- Set `npm start` as the command to run the container.

*It is important to test the docker container before deploying*

### Running the Container ###
Try running `docker run -p 80:3001 -d 146.203.54.165:5000/ldr:latest` to run the application and find it at the ip address found by running `boot2docker ip`

### Errors in Deploying ###
`npm run build` will error if docker is not configured correctly. Make sure the correct variables are set in your ~/.bash_profile or its equivalent. (These variables are different for each user. Docker will error and tell you how to fix these errors if they occur.)

### Push to Docker Hub ###
Running `npm run deploy` will push the previously built Dockerfile to [Docker Hub](https://hub.docker.com/account/signup/) and make a post to Marathon telling it to restart the application.

On restart, the Marathon application will pull the latest Docker container from our private DockerHub and host it at http://www.amp.pharm.mssm.edu/LDR/.
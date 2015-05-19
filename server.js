var express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
//    timeout = require('connect-timeout'),
    compress = require('compression');

var app = express();
var port = 3001;

var configDB = require('./backend/config/database');

mongoose.connect(configDB.url);

// Uncomment to view mongoose more verbose console logging
//mongoose.set('debug', true);

app.use(cors());
<<<<<<< HEAD
app.use(timeout('20s'));
=======
//app.use(timeout('2s'));
>>>>>>> cffde3a06cfc3ec300a3bc944b5bb83d2b2feaa1
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(compress());

var publicDir = __dirname + '/public/';
console.log('Serving static files from ' + publicDir);
app.use('/', express.static(path.join(publicDir)));

require('./backend/routes')(app);

app.get('/', function (req, res) {
    res.sendFile(publicDir + '/index.html');
});

app.use(function (err, req, res) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Token invalid. You must be logged in to proceed.');
    }
});

<<<<<<< HEAD
app.use(haltOnTimeout);
function haltOnTimeout(req, res, next) {
    if (!req.timeout) {
        next();
    }
}
=======
//app.use(haltOnTimedout);

//function haltOnTimedout(req, res, next) {
//    if (!req.timeout) {
//        next();
//    }
//}
>>>>>>> cffde3a06cfc3ec300a3bc944b5bb83d2b2feaa1

app.listen(port);
console.log('The magic is happening on port ' + port);

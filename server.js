var express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    compress = require('compression');

var app = express();
var port = process.env.PORT || 3001;
app.set('port', port);

var configDB = require('./backend/config/database');

mongoose.connect(configDB.url);

// Uncomment to view mongoose more verbose console logging
//mongoose.set('debug', true);

app.use(cors());
app.use(timeout('20s'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(compress());

var publicDir = __dirname + '/';
console.log('Serving static files from ' + publicDir);
app.use('/LDR', express.static(path.join(publicDir)));

require('./backend/routes')(app);

app.get('/', function (req, res) {
    res.sendFile(publicDir + 'index.html');
});

app.use(function (err, req, res) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Token invalid. You must be logged in to proceed.');
    }
});

app.use(haltOnTimeout);
function haltOnTimeout(req, res, next) {
    if (!req.timeout) {
        next();
    }
}

app.listen(app.get('port'), function() {
    if (process.send) {
        process.send('online');
    } else {
        console.log('The server is running at http://localhost:' +
            app.get('port'));
    }
});
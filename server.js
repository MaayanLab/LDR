var express = require('express'),
    mongoose = require('mongoose'),
    cors = require('cors'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    path = require('path'),
    bodyParser = require('body-parser'),
    compress = require('compression');

var app = express();
var port = 3001;

var configDB = require('./backend/config/database');

mongoose.connect(configDB.url);

app.use(cors());
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(compress());

var publicDir = __dirname + '/public/';
console.log('Serving static files from ' + publicDir);
app.use('/', express.static(path.join(publicDir)));

/*app.get('*.css', function (req, res, next) {
    res.setHeader('Content-Type', 'text/css');
});*/

require('./backend/routes')(app);

app.get('/*', function (req, res) {
    res.sendFile(publicDir + '/index.html');
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Token invalid. You must be logged in to proceed.');
    }
});

app.listen(port);
console.log('The magic is happening on port ' + port);
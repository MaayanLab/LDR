var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    cors = require('cors'),
    flash = require('connect-flash'),

    morgan = require('morgan'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    session = require('express-session');

var app = express();
var port = 3001;

var configDB = require('./backend/config/database');

mongoose.connect(configDB.url);

require('./backend/config/passport')(passport); // pass passport for configuration

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));

// required for passport
app.use(session({
    secret: configDB.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(compress());

var publicDir = __dirname + '/public';
console.log(publicDir);

app.use('/js', express.static(path.join(publicDir + '/js')));
app.use('/css', express.static(path.join(publicDir + '/css')));
app.use('/views', express.static(path.join(publicDir + '/views')));
app.use('/vendor', express.static(path.join(publicDir + '/vendor')));

app.get('/js', function (req, res, next) {
    res.setHeader('Content-Type', 'application/javascript');
});

/*app.get('*.css', function (req, res, next) {
    res.setHeader('Content-Type', 'text/css');
});*/

require('./backend/routes')(app, passport);

app.get('/', function (req, res) {
    res.sendFile(publicDir + '/index.html');
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Token invalid. You must be logged in to proceed.');
    }
});

app.listen(port);
console.log('Everything\'s going down on port ' + port);
